const { src, dest, parallel, series, watch } = require('gulp');

const pug = require('gulp-pug');
const sass = require ("gulp-sass")(require('sass'));
const base64 = require('gulp-base64-inline');
const styleInject = require("gulp-style-inject");
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");

const path = {
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


const buildPug = () => {
    return src(path.src.pug)
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(base64(null, {
            prefix: "",
            suffix: ""
        }))
        .pipe(dest(path.build.pug))
        .pipe(browserSync.stream());;
}

const buildCSS = () => {
    return src(path.src.css)
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

const buildInlineCSS = () => {
    return src(path.build.html)
        .pipe(styleInject())
        .pipe(dest(path.build.root))
        .pipe(browserSync.stream());
}


const cleanRootPath = () => {
    return src(path.build.root, { allowEmpty: true })
        .pipe(clean())
};


const $browserSync = (cb) => {
    browserSync.init({
        server: {
            baseDir: path.build.root
        },
    });

    watch(path.watch.css, series(buildCSS, buildPug, buildInlineCSS));
    watch(path.watch.pug, series(buildCSS, buildPug, buildInlineCSS));
    // watch(path.build.html).on("change", browserSync.reload);
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

const $build = series(
    cleanRootPath,
    buildCSS,
    buildPug,
    buildInlineCSS,
)

exports.build = $build;
exports.dev = $dev;


