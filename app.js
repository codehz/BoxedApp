const { remote } = require(`electron`);
const rdb = remote.getGlobal(`db`);

module.exports = {
    config: {
        title: `Boxed Application Platform`,
        hideTitle: true,
        titleColor: `#007acc`,
        invColor: true,
        minSize: [500, 300],
        size: [800, 600]
    },
    content: ({ symbols: sym, utils: { css } }) => ({
        [sym.components]: [
            css`
            h1 {
                margin: 0;
                background: #007acc;
                color: white;
                padding: 10px;
                font-weight: lighter;
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            `,
            {
                [sym.element]: `h1`,
                [sym.text]: `Boxed Application Platform`
            },
            {
                [sym.classList]: [`applist-container`],
                [sym.components]: [
                    {
                        [sym.element]: `menu`,
                        type: `toolbar`,
                        [sym.components]: [
                            {
                                [sym.element]: `menuitem`,
                                type: `command`,
                                label: `Add`
                            }
                        ]
                    },
                    {
                        [sym.element]: `table`,
                        [sym.components]: [
                            {
                                [sym.element]: `thead`,
                                [sym.components]: [
                                    {
                                        [sym.element]: `tr`,
                                        [sym.components]: [
                                            {
                                                [sym.element]: `th`,
                                                [sym.text]: `key`
                                            },
                                            {
                                                [sym.element]: `th`,
                                                [sym.text]: `name`
                                            },
                                            {
                                                [sym.element]: `th`,
                                                [sym.text]: `base`
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                [sym.element]: `tbody`,
                                [sym.fetch]() {
                                    return rdb.keys().map(key =>
                                        Object.assign(rdb.get(key), {
                                            [sym.key]: key
                                        })
                                    );
                                },
                                [sym.template]: {
                                    [sym.element]: `tr`,
                                    [sym.components]: [
                                        {
                                            [sym.element]: `td`,
                                            dataProp: `key`,
                                            [sym.render]({
                                                [sym.key]: key
                                            }) {
                                                this.setAttribute(`data-value`, key);
                                            }
                                        },
                                        {
                                            [sym.element]: `td`,
                                            dataProp: `name`,
                                            [sym.render]({
                                                name
                                            }) {
                                                this.setAttribute(`data-value`, name);
                                            }
                                        },
                                        {
                                            [sym.element]: `td`,
                                            dataProp: `base`,
                                            [sym.render]({
                                                base
                                            }) {
                                                this.setAttribute(`data-value`, base);
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    })
};
