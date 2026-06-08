import React from 'react';

export default {
    title: 'Introduction',
};

export const About = () => {
    return (
        <div className="story-wrapper">
            <div className="story-description">
                <h1 className="story-title">Whimsy File Browser v2.x Storybook</h1>
                <p>
                    This is the Storybook for Whimsy File Browser v2.x. It contains code examples for
                    different Chonky use cases. Please use the sidebar to choose a
                    relevant story.
                </p>
                <h2 className="story-title">Available resources</h2>
                <p>Whimsy File Browser v2.x documentation consists of three parts:</p>
                <ol>
                    <li>
                        <a href="https://github.com/Numeracode/whimsy-file-browser">Repository</a>. This page
                        contains the list of features Chonky supports, and a simple File
                        Browser demo.
                    </li>
                    <li>
                        <a href="/docs/intro">Documentation site</a>.
                        This site contains detailed documentation of Chonky features and
                        some short code snippets.
                    </li>
                    <li className="css-q43a5f">
                        <a href="/storybook">Storybook</a>{' '}
                        <strong>(you are here)</strong>. This site contains real world
                        examples of how Chonky can be used. It also showcases advanced
                        usage of Chonky components.
                    </li>
                </ol>
            </div>
        </div>
    );
};
