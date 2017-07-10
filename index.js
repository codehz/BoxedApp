`use strict`;

const { app, BrowserWindow, protocol } = require(`electron`);

app.makeSingleInstance(commandLine => {
    procArgs(...commandLine.slice(1));
}) && app.quit();

const fs = require(`fs`);
const path = require(`path`);
const url = require(`url`);
const querystring = require(`querystring`);
const { URL } = url;
const stat = p => new Promise((resolve, reject) => fs.stat(p, (err, tstat) => (err ? reject(err) : resolve(tstat))));

protocol.registerStandardSchemes([`app`], { secure: true });

let winSet = new Set();

const flatfile = require(`flat-file-db`);
const db = flatfile.sync(path.join(app.getPath(`userData`), `app.jsondb`));

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

async function procArgs(urlStr = `boxed://app/`) {
    const curl = new URL(urlStr);
    console.log(curl);
    const base = curl.hostname === `app` ? __dirname : db.has(curl.hostname) && db.get(curl.hostname).base;
    if (!base)
        return createWindow({
            target: `./notfound.js`,
            base: url.format({
                protocol: `app`,
                hostname: `app`
            }),
            url: urlStr
        });
    createWindow({
        target: await fetchIndex(path.join(base, curl.pathname), [`app.js`, `index.js`], [`js`], `./notfound.js`),
        base: url.format({
            protocol: `app`,
            hostname: `app`
        }),
        url: urlStr
    });
}

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
    procArgs(...process.argv.slice(1));
});

function createWindow(obj) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, `box`, `box.js`),
            experimentalFeatures: true,
            experimentalCanvasFeatures: true,
            defaultEncoding: `UTF-8`,
            defaultFontFamily: {
                standard: `Microsoft Yahei UI`,
                sansSerif: `Microsoft Yahei UI`,
                monospace: `Inziu Iosevka SC`
            }
        }
    });
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, `index.html`),
            protocol: `file:`,
            search: querystring.stringify(obj),
            slashes: true
        })
    );
    win.webContents.openDevTools();
    win.on(`closed`, () => winSet.delete(win));
    winSet.add(win);
}

app.on(`window-all-closed`, () => app.quit());
