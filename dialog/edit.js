const { remote } = require(`electron`);
const rdb = remote ? remote.getGlobal(`db`) : global.db;
const { URL } = require(`url`);
const turl = remote ? new URL(location.href) : null;

module.exports = {
    config: {
        title: `Edit Application Register`,
        minSize: [400, 200],
        maxSize: [400, 200],
        size: [400, 200],
        resizable: false
    },
    content: ({ symbols: sym, utils: { css, el } }, win) => ({
        [sym.components]: [
            css`
            :host {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            form {
                display: flex;
                flex-direction: column;
                align-items: stretch;
                width: 400px;
                height: 100%;
                box-sizing: border-box;
                padding: 6px;
            }
            form > * {
                margin: 4px;
            }
            label {
                display: flex;
                font-size: 15px;
                justify-content: flex-end;
                font-size: 14px;
                font-weight: 100;
            }
            label input {
                width: 300px;
                -webkit-appearance: none;
                box-sizing: border-box;
                margin-left: 8px;
                font-weight: 100;
                font-family: sans-serif;
            }
            label input[type="text"] {
                border: none;
                box-shadow: inset 0 -1px 0 #007acc;
                outline: none;
                padding: 0 4px;
            }
            .pad {
                flex: 1;
            }
            .button-bar {
                display: flex;
                margin: -6px;
                padding: 10px;
                background-color: #eeeeee;
            }
            .button-bar button {
                flex: 1;
                background-color: transparent;
                cursor: pointer;
                border: none;
                padding: 4px;
                transition: all .2s ease;
                font-family: sans-serif;
                font-weight: 100;
            }
            .button-bar button:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }
            .button-bar button[type="submit"] {
                background-color: #0d5687;
                color: white;
                font-weight: 900;
            }
            .button-bar button[type="submit"]:hover {
                background-color: #007acc;
            }
            `,
            el`form`(
                [
                    el`label`(`Key`, [el`input[type="text"][name="key"][required=true][readOnly=true]`({
                        value: new URL(turl.searchParams.get(`url`)).hash.slice(1)
                    })]),
                    el`label`(`Name`, [el`input[type="text"][name="name"][required=true][autofocus=true]`()]),
                    el`label`(`Base`, [el`input[name="base"][type="file"][webkitdirectory=true][required=true]`()]),
                    el`div.pad`(),
                    el`div.button-bar`([
                        el`button[type="submit"]`(`Register`),
                        el`button[type="reset"]`(`Cancel`, {
                            onclick() {
                                win.close();
                            }
                        })
                    ])
                ],
                {
                    onsubmit() {
                        rdb.put(this.key.value, {
                            name: this.name.value,
                            base: this.base.files[0].path
                        });
                        win.close();
                    }
                }
            )
        ]
    })
};
