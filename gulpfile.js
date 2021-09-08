const { src, dest, parallel, series, watch } = require('gulp');

const pug = require('gulp-pug');
const sass = require ("gulp-sass")(require('sass'));
const base64 = require('gulp-base64-inline');
const styleInject = require("gulp-style-inject");
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");

const isDev = !!process.argv.includes("dev");

let config = {
    build: {
        root: "./dist/",
        html: "./dist/*.html",
        css: "./dist/css",
        pug: "./dist/",
    },
    src: {
        pug: "./src/*.pug",
        css: "./src/css/*.scss",
    },
    watch: {
        pug: "./src/**/*.pug",
        css: "./src/css/**/*.scss"
    }
};

const buildConfig = {
    src: {
        pug: "./src/current.pug",
        css: "./src/css/styles.scss"
    }
}

// console.log("ПРОЦЕСС", process.argv)


const buildPug = () => {
    return src(config.src.pug)
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(base64(null, {
            prefix: "",
            suffix: ""
        }))
        .pipe(dest(config.build.pug))
        .pipe(browserSync.stream());
}

const buildCSS = () => {
    return src(config.src.css)
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(dest(config.build.css))
        .pipe(browserSync.stream());
}

const buildInlineCSS = () => {
    return src(config.build.html)
        .pipe(styleInject())
        .pipe(dest(config.build.root))
        .pipe(browserSync.stream());
}


const cleanRootPath = () => {
    return src(config.build.root, { allowEmpty: true })
        .pipe(clean())
};

const cleanBuildCssPath = () => {
    return src(config.build.css, { allowEmpty: true })
        .pipe(clean())
}


const $browserSync = (cb) => {
    browserSync.init({
        server: {
            baseDir: config.build.root
        },
    });

    watch(config.watch.css, series(buildCSS, buildPug, buildInlineCSS));
    watch(config.watch.pug, series(buildCSS, buildPug, buildInlineCSS));
}

const $dev = series(
    cleanRootPath,
    buildCSS,
    buildPug,
    buildInlineCSS,
    parallel(
        $browserSync,
    )
)

const $build = () => {
    if (!isDev) config = {...config, ...buildConfig};

    return series(
        cleanRootPath,
        buildCSS,
        buildPug,
        buildInlineCSS,
        cleanBuildCssPath,
    )
}

exports.build = $build();
exports.dev = $dev;


