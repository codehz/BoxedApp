`use strict`;

const { app, BrowserWindow, protocol } = require(`electron`);

const fs = require(`fs`);
const path = require(`path`);
const url = require(`url`);
const querystring = require(`querystring`);
const { URL } = url;
const stat = p => new Promise((resolve, reject) => fs.stat(p, (err, tstat) => (err ? reject(err) : resolve(tstat))));

protocol.registerStandardSchemes([`app`], { secure: true });

const xelJS = fs.readFileSync(path.join(__dirname, `node_modules/xel/xel.min.js`), `utf-8`);
const xelCSS = fs.readFileSync(path.join(__dirname, `node_modules/xel/stylesheets/vanilla.theme.css`), `utf-8`);

let winSet = new Set();

const flatfile = require(`flat-file-db`);
const db = flatfile.sync(path.join(app.getPath(`userData`), `app.jsondb`));

global.db = db;

if (!app.isDefaultProtocolClient(`boxed`, process.argv[0])) {
    app.setAsDefaultProtocolClient(`boxed`, process.argv[0]);
}

async function fetchIndex(tpath, indexName = [`index.html`], exts = [], failed = undefined) {
    try {
        const tstat = await stat(tpath);
        if (tstat.isDirectory()) {
            for (const name of indexName) {
                try {
                    await stat(path.join(tpath, name));
                    return path.join(tpath, name);
                } catch (e) {
                    continue;
                }
            }
            return failed;
        }
        return tpath;
    } catch (e) {
        for (const name of exts) {
            try {
                await stat(`${tpath}.${name}`);
                return `${tpath}.${name}`;
            } catch (e) {
                continue;
            }
        }
        return failed;
    }
}

async function getSearchParam(urlStr) {
    const curl = new URL(urlStr);
    console.log(curl);
    const base = curl.hostname === `app` ? __dirname : db.has(curl.hostname) && db.get(curl.hostname).base;
    if (!base)
        return {
            target: path.join(__dirname, `/notfound.js`),
            base: url.format({
                protocol: `app`,
                hostname: `app`
            }),
            url: urlStr
        };
    return {
        target: await fetchIndex(
            path.join(base, curl.pathname),
            [`app.js`, `index.js`],
            [`js`],
            path.join(__dirname, `/notfound.js`)
        ),
        base: url.format({
            protocol: `app`,
            hostname: curl.hostname
        }),
        url: urlStr
    };
}

async function openURL(urlStr = `boxed://app/`, parent, modal) {
    createWindow(await getSearchParam(urlStr), parent, modal);
}

global.openURL = openURL;

app.on(`ready`, () => {
    protocol.registerFileProtocol(`app`, async ({ url: source, method }, callback) => {
        if (method != `GET`) return -11;
        const surl = new URL(source);
        const base = surl.hostname === `app` ? __dirname : db.has(url.hostname) && db.get(url.hostname).base;
        if (!base) return callback();
        callback(
            await fetchIndex(
                path.join(base, surl.pathname),
                [`index.html`, `index.htm`, `index.js`],
                [`html`, `htm`, `js`],
                -6
            )
        );
    });
    openURL(...process.argv.slice(1));
});

function createWindow(obj, parent, modal = false) {
    try {
        const sub = require(obj.target);
        const {
            config: {
                title,
                size: [width, height] = [],
                minSize: [minWidth = 200, minHeight = 100] = [],
                maxSize: [maxWidth, maxHeight] = [],
                resizable = true,
                maximizable = resizable,
                alwaysOnTop,
                backgroundColor
            }
        } = sub;
        console.log(`title: `, title);
        const win = new BrowserWindow({
            title,
            width,
            height,
            minWidth,
            minHeight,
            maxWidth,
            maxHeight,
            resizable,
            maximizable,
            alwaysOnTop,
            backgroundColor,
            frame: false,
            parent,
            modal,
            webPreferences: {
                preload: path.join(__dirname, `box`, `box.js`),
                experimentalFeatures: true,
                experimentalCanvasFeatures: true,
                defaultEncoding: `UTF-8`,
                defaultFontFamily: {
                    monospace: `Inziu Iosevka SC`
                }
            }
        });
        win.loadURL(
            url.format({
                hostname: `app`,
                protocol: `app:`,
                search: querystring.stringify(obj),
                slashes: true
            })
        );
        //win.webContents.openDevTools();
        win.on(`closed`, () => winSet.delete(win));
        winSet.add(win);
    } catch (e) {
        console.log(e);
    }
}

app.on(`window-all-closed`, () => app.quit());
