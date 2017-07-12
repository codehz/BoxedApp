const { remote } = require(`electron`);
const rdb = remote ? remote.getGlobal(`db`) : global.db;
const url = require(`url`);
let menu = null;
let menutarget = null;
if (remote) {
    const { Menu } = remote;
    menu = Menu.buildFromTemplate([
        {
            label: `Start`,
            click() {
                window.open(
                    url.format({
                        protocol: `boxed`,
                        hostname: menutarget,
                        slashes: true
                    }),
                    false,
                    null
                );
            }
        },
        {
            label: `Edit`,
            click() {
                window.open(
                    url.format({
                        hostname: `app`,
                        protocol: `boxed:`,
                        pathname: `/dialog/edit`,
                        hash: menutarget,
                        slashes: true
                    }),
                    true
                );
            }
        },
        { type: `separator` },
        {
            label: `Delete`,
            click() {
                rdb.del(menutarget);
            }
        }
    ]);
}

module.exports = {
    config: {
        title: `Boxed Application Platform`,
        hideTitle: true,
        titleColor: `#007acc`,
        backgroundColor: `#0d5687`,
        invColor: true,
        minSize: [500, 300],
        size: [800, 600]
    },
    content: ({ symbols: sym, utils: { css, el } }, win) => ({
        [sym.context]: {
            list: []
        },
        [sym.init]() {
            const update = () =>
                (this[sym.context].list = rdb.keys().map(key =>
                    Object.assign(rdb.get(key), {
                        [sym.key]: key
                    })
                ));
            update();
            rdb.on(`drain`, update);
        },
        [sym.components]: [
            css`
            :host {
                display: flex;
                flex-direction: column;
            }
            h1 {
                margin: 0;
                background: #007acc;
                color: white;
                padding: 10px;
                font-weight: lighter;
                -webkit-app-region: drag;
                user-select: none;
            }
            .applist-container {
                display: flex;
                flex: 1;
                flex-direction: column;
                overflow-y: auto;
                overflow-x: auto;
                background-color: white;
            }
            .applist-container::-webkit-scrollbar {
                width: 16px;
                height: 16px;
                background-color: #0d5687;
            }
            .applist-container::-webkit-scrollbar-track {
                margin-bottom: 32px;
            }
            .applist-container::-webkit-scrollbar-thumb {
                background-color: #007acc;
            }
            menu[type="toolbar"] {
                display: flex;
                justify-content: flex-end;
                align-items: stretch;
                margin: 0;
                padding: 0;
                font-weight: 100;
                background-color: #0d5687;
                color: white;
                height: 32px;
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
            }
            menuitem[type="command"] {
                position: relative;
                margin: 0;
                padding: 5px 10px;
                background-color: transparent;
                transition: all .2s ease;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            menuitem[type="command"]::before {
                content: attr(label);
            }
            menuitem[type="command"]:hover {
                background-color: #007acc;
            }
            table {
                width: 100%;
                border-spacing: 0;
                margin-bottom: 32px;
            }
            table thead {
                background-color: #0d5687;
                color: white;
            }
            table thead th {
                font-weight: 100;
                padding: 5px 10px;
                text-align: left;
                height: 32px;
                box-sizing: border-box;
            }
            table tbody td {
                font-weight: 100;
                font-family: monospace;
                padding: 5px 10px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
            }
            table tbody tr {
                background-color: rgba(0, 0, 0, 0);
                transition: all .2s ease;
            }
            table tbody tr:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }
            table tbody td::before {
                content: attr(data-value);
                color: black;
            }
            `,
            el`h1`(`Boxed Application Platform`),
            el`div.applist-container`([
                el`table`([
                    el`thead`([el`tr`([`key`, `name`, `base`].map(s => el`th`(s)))]),
                    el`tbody`({
                        [sym.fetch]() {
                            return this[sym.context].list;
                        },
                        [sym.template]: el`tr`(
                            [
                                el`td[dataProp="key"]`({
                                    [sym.render]({ [sym.key]: key }) {
                                        this.setAttribute(`data-value`, key);
                                    }
                                }),
                                el`td[dataProp="name"]`({
                                    [sym.render]({ name }) {
                                        this.setAttribute(`data-value`, name);
                                    }
                                }),
                                el`td[dataProp="base"]`({
                                    [sym.render]({ base }) {
                                        this.setAttribute(`data-value`, base);
                                    }
                                })
                            ],
                            {
                                [sym.render]({ [sym.key]: key }) {
                                    this.setAttribute(`data-key`, key);
                                    return sym.broadcast;
                                },
                                oncontextmenu() {
                                    menutarget = this.getAttribute(`data-key`);
                                    menu.popup(win, { async: true });
                                },
                                ondblclick() {
                                    menutarget = this.getAttribute(`data-key`);
                                    window.open(
                                        url.format({
                                            protocol: `boxed`,
                                            hostname: menutarget,
                                            slashes: true
                                        }),
                                        false,
                                        null
                                    );
                                }
                            }
                        )
                    })
                ]),
                el`menu[type="toolbar"]`([
                    el`menuitem[type="command"][label="Add"]`({
                        onclick() {
                            window.open(`boxed://app/dialog/add`, true);
                        }
                    })
                ])
            ])
        ]
    })
};
