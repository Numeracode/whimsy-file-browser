/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2020
 * @license MIT
 */

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { reduxActions } from '../../redux/reducers';
import { selectSearchString } from '../../redux/selectors';
import { ChonkyIconName } from '../../types/icons.types';
import { useDebounce } from '../../util/hooks-helpers';
import { getI18nId, I18nNamespace } from '../../util/i18n';
import { ChonkyIconContext } from '../../util/icon-helper';
import { important, makeGlobalChonkyStyles } from '../../util/styles';

export interface ToolbarSearchProps {}

export const ToolbarSearch: React.FC<ToolbarSearchProps> = React.memo(() => {
    const intl = useIntl();
    const searchPlaceholderString = intl.formatMessage({
        id: getI18nId(I18nNamespace.Toolbar, 'searchPlaceholder'),
        defaultMessage: 'Search',
    });

    const classes = useStyles();
    const ChonkyIcon = useContext(ChonkyIconContext);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useDispatch();
    const reduxSearchString = useSelector(selectSearchString);

    const [localSearchString, setLocalSearchString] = useState(reduxSearchString);
    const [debouncedLocalSearchString] = useDebounce(localSearchString, 300);
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

    useEffect(() => {
        dispatch(
            reduxActions.setFocusSearchInput(() => {
                if (searchInputRef.current) searchInputRef.current.focus();
            })
        );
        return () => {
            dispatch(reduxActions.setFocusSearchInput(null));
        };
    }, [dispatch]);

    useEffect(() => {
        setShowLoadingIndicator(false);
        dispatch(reduxActions.setSearchString(debouncedLocalSearchString));
    }, [debouncedLocalSearchString, dispatch]);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setShowLoadingIndicator(true);
        setLocalSearchString(event.currentTarget.value);
    }, []);
    const handleKeyUp = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Escape') {
                setLocalSearchString('');
                dispatch(reduxActions.setSearchString(''));
                if (searchInputRef.current) searchInputRef.current.blur();
            }
        },
        [dispatch]
    );

    return (
        <div className={classes.searchFieldContainer}>
            <span className={classes.searchIcon}>
                <ChonkyIcon
                    icon={showLoadingIndicator ? ChonkyIconName.loading : ChonkyIconName.search}
                    spin={showLoadingIndicator}
                />
            </span>
            <input
                className={classes.searchFieldInput}
                type="text"
                value={localSearchString}
                placeholder={searchPlaceholderString}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                ref={searchInputRef}
            />
        </div>
    );
});

const useStyles = makeGlobalChonkyStyles(theme => ({
    searchFieldContainer: {
        height: theme.toolbar.size,
        width: 150,
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.toolbar.buttonRadius,
        overflow: 'hidden',
    },
    searchIcon: {
        fontSize: '0.9em',
        opacity: 0.75,
        paddingLeft: 8,
        display: 'flex',
        alignItems: 'center',
    },
    searchFieldInput: {
        lineHeight: important(0),
        padding: important(0),
        margin: important(0),
        fontSize: important(theme.toolbar.fontSize),
        paddingLeft: 8,
        height: theme.toolbar.size - 4,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        color: 'inherit',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
    },
}));
