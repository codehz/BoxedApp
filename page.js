const { box, symbols: sym, utils: { css } } = window.boxjs;
const electron = require(`electron`);
const { remote, webFrame } = electron;
const win = remote.getCurrentWindow();
const { URL } = require(`url`);
const turl = new URL(location.href);
const appcfg = require(turl.searchParams.get(`target`));

webFrame.registerURLSchemeAsPrivileged(`app`);

win.webContents.once(`did-finish-load`, () => {
    win.setMinimumSize(...(appcfg.config.minSize || [800, 600]));
    win.setSize(...(appcfg.config.size || [800, 600]));
    win.setTitle(appcfg.config.title || `no title`);
    win.show();
});

const devicePixelRatio = window.devicePixelRatio;
function initCanvas(canvas, width, height) {
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
}

box({
    [sym.element]: document.documentElement,
    [sym.components]: [
        css`
        body {
            margin: 0;
            padding: 0;
            user-select: none;
        }
        main {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        article {
            flex: 1;
        }
        * {
            cursor: default;
        }
        header {
            -webkit-app-region: drag;
            height: 24px;
            width: 100%;
            font-size: 16px;
            font-weight: 100;
            background-color: ${appcfg.config.titleColor || `white`};
            display: flex;
            align-items: center;
        }
        `,
        {
            [sym.element]: `base`,
            href: turl.searchParams.get(`base`)
        },
        {
            [sym.element]: `main`,
            [sym.components]: [
                {
                    [sym.element]: `header`,
                    [sym.shadows]: [
                        {
                            [sym.components]: [
                                css`
                                :host {
                                    display: flex;
                                }
                                ::slotted(*) {
                                    flex: 1;
                                    padding-left: 10px;
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
                                `,
                                { [sym.element]: `slot` },
                                {
                                    [sym.classList]: [`ctrls`],
                                    [sym.components]: [
                                        {
                                            title: `minimize`,
                                            action: () => win.minimize(),
                                            draw: canvas => {
                                                const ctx = canvas.getContext(`2d`);
                                                const { width, height } = canvas;
                                                ctx.beginPath();
                                                ctx.moveTo(
                                                    Math.floor(width * 0.35) + 0.5,
                                                    Math.floor(height * 0.5) - 0.5
                                                );
                                                ctx.lineTo(
                                                    Math.ceil(width * 0.65) - 0.5,
                                                    Math.floor(height * 0.5) - 0.5
                                                );
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
                                                ctx.lineTo(
                                                    Math.ceil(width / 2 + height / 6),
                                                    Math.ceil(2 * height / 3)
                                                );
                                                ctx.stroke();
                                                ctx.beginPath();
                                                ctx.moveTo(
                                                    Math.floor(width / 2 - height / 6),
                                                    Math.ceil(2 * height / 3)
                                                );
                                                ctx.lineTo(Math.ceil(width / 2 + height / 6), Math.floor(height / 3));
                                                ctx.stroke();
                                            }
                                        }
                                    ].map(({ title, action, draw }) => ({
                                        [sym.classList]: [title],
                                        [sym.components]: [
                                            {
                                                [sym.element]: `canvas`,
                                                [sym.init]() {
                                                    initCanvas(this, 36, 24);
                                                    draw(this);
                                                }
                                            }
                                        ],
                                        onclick: action
                                    }))
                                }
                            ]
                        }
                    ],
                    [sym.components]: [
                        {
                            [sym.element]: `span`,
                            [sym.text]: !appcfg.config.hideTitle && appcfg.config.title || ``
                        }
                    ]
                },
                {
                    [sym.element]: `article`,
                    [sym.shadows]: [appcfg.content(window.boxjs)]
                }
            ]
        }
    ]
});
