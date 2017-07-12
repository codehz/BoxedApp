const { box, symbols: sym, utils: { css, el, text } } = window.boxjs;
const electron = require(`electron`);
const { remote, webFrame } = electron;
const win = remote.getCurrentWindow();
const { URL } = require(`url`);
const turl = new URL(location.href);
const appcfg = require(turl.searchParams.get(`target`));

const { config: { resizable = true, maximizable = resizable } } = appcfg;

window.open = (url, modal, parent = win) => remote.getGlobal(`openURL`)(url, parent, modal);

webFrame.registerURLSchemeAsPrivileged(`app`);

const devicePixelRatio = window.devicePixelRatio;
function initCanvas(canvas, width, height) {
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
}

box({
    [sym.element]: document.body,
    [sym.components]: [
        css`
        body {
            margin: 0;
            padding: 0;
            user-select: none;
            overflow: hidden;
        }
        main {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        article {
            flex: 1;
            user-select: none;
        }
        * {
            cursor: default;
        }
        header {
            height: 24px;
            width: 100%;
            font-size: 16px;
            font-weight: 100;
            background-color: ${appcfg.config.titleColor || `white`};
            display: flex;
            align-items: center;
        }
        `,
        el`base[href="${turl.searchParams.get(`base`)}"]`(),
        el`main`([
            el`header`({
                [sym.shadows]: [
                    {
                        [sym.components]: [
                            css`
                            :host {
                                display: flex;
                            }
                            ::slotted(*) {
                                flex: 1;
                                margin-left: 10px;
                                -webkit-app-region: drag;
                                user-select: none;
                                color: ${appcfg.config.invColor ? `white` : `black`};
                            }
                            .ctrls {
                                position: relative;
                                display: flex;
                                cursor: pointer;
                                -webkit-app-region: no-drag;
                            }
                            .ctrls > * {
                                position: relative;
                                background-size: cover;
                                padding: 0 5px;
                                width: 36px;
                                height: 24px;
                                border: none;
                                background-color: rgba(0, 0, 0, 0);
                                margin: 0;
                                transition: all .2s ease;
                            }
                            .ctrls > * > canvas {
                                width: 36px;
                                height: 24px;
                                filter: invert(${appcfg.config.invColor ? `100` : `0`}%);
                                transition: all .2s ease;
                            }
                            .ctrls > *:hover {
                                background-color: rgba(0, 0, 0, 0.1);
                            }
                            .ctrls > .close:hover {
                                background-color: #e81123;
                            }
                            .ctrls > .close:hover > canvas {
                                filter: invert(100%);
                            }
                            .ctrls > .maximize {
                                display: ${maximizable ? `block` : `none`}
                            }
                            `,
                            el`slot`(),
                            el`div.ctrls`(
                                [
                                    {
                                        title: `minimize`,
                                        action: () => win.minimize(),
                                        draw: canvas => {
                                            const ctx = canvas.getContext(`2d`);
                                            const { width, height } = canvas;
                                            ctx.beginPath();
                                            ctx.moveTo(Math.floor(width * 0.37) + 0.5, Math.floor(height * 0.5) - 0.5);
                                            ctx.lineTo(Math.ceil(width * 0.63) - 0.5, Math.floor(height * 0.5) - 0.5);
                                            ctx.stroke();
                                        }
                                    },
                                    {
                                        title: `maximize`,
                                        action: () => (win.isMaximized() ? win.unmaximize() : win.maximize()),
                                        draw: canvas => {
                                            const ctx = canvas.getContext(`2d`);
                                            const { width, height } = canvas;
                                            ctx.beginPath();
                                            ctx.strokeRect(
                                                Math.floor(width / 2 - height / 6) + 0.5,
                                                Math.floor(height / 3) + 0.5,
                                                Math.ceil(height / 3),
                                                Math.ceil(height / 3)
                                            );
                                        }
                                    },
                                    {
                                        title: `close`,
                                        action: () => win.close(),
                                        draw: canvas => {
                                            const ctx = canvas.getContext(`2d`);
                                            const { width, height } = canvas;
                                            ctx.beginPath();
                                            ctx.moveTo(Math.floor(width / 2 - height / 6), Math.floor(height / 3));
                                            ctx.lineTo(Math.ceil(width / 2 + height / 6), Math.ceil(2 * height / 3));
                                            ctx.stroke();
                                            ctx.beginPath();
                                            ctx.moveTo(Math.floor(width / 2 - height / 6), Math.ceil(2 * height / 3));
                                            ctx.lineTo(Math.ceil(width / 2 + height / 6), Math.floor(height / 3));
                                            ctx.stroke();
                                        }
                                    }
                                ].map(({ title, action, draw }) =>
                                    el`div.${title}`(
                                        [
                                            el`canvas`({
                                                [sym.init]() {
                                                    initCanvas(this, 36, 24);
                                                    draw(this);
                                                }
                                            })
                                        ],
                                        { onclick: action }
                                    )
                                )
                            )
                        ]
                    }
                ],
                [sym.components]: [
                    el`span`(appcfg.config.title + ``, {
                        [sym.init]() {
                            win.on(`page-title-updated`, (event, title) => (this.innerText = title));
                        }
                    })
                ]
            }),
            el`article`({ [sym.shadows]: [appcfg.content(window.boxjs, win, window)] })
        ])
    ]
});
