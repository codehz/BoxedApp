const { URL } = require(`url`);
const turl = new URL(location.href);

module.exports = {
    config: {
        title: `Target App Not Found`,
        minSize: [400, 300],
        maxSize: [400, 300],
        size: [400, 300]
    },
    content: ({ symbols: sym, utils: { css } }) => ({
        [sym.components]: [
            css`
            :host {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-app-region: drag;
                -webkit-user-select: none;
            }
            span {
                font-weight: lighter;
            }
            `,
            {
                [sym.element]: `span`,
                [sym.text]: `App '${turl.searchParams.get(`url`)}' Not Found`
            }
        ]
    })
};
