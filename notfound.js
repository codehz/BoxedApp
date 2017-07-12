const { URL } = require(`url`);

module.exports = {
    config: {
        title: `Target App Not Found`,
        minSize: [400, 300],
        maxSize: [400, 300],
        size: [400, 300]
    },
    content: ({ symbols: sym, utils: { css, el } }, win, window) => ({
        [sym.components]: [
            css`
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-app-region: drag;
                user-select: none;
            }
            span {
                font-weight: lighter;
            }
            `,
            el`span`(`App '${new URL(window.location.href).searchParams.get(`url`)}' Not Found`)
        ]
    })
};
