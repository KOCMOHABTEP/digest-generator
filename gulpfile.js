const { src, dest, parallel, series, watch } = require('gulp');

const pug = require('gulp-pug');
const sass = require ("gulp-sass")(require('sass'));
const base64 = require('gulp-base64-inline');
const styleInject = require("gulp-style-inject");
const uglify = require("gulp-uglify");
const inject = require('gulp-inject');
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");

this.context = null;
this.contextProcess = null;

if (process.argv.includes("$build_digest")) {
    console.log({context: "digest", contextProcess: "build"})
    this.context = "digest";
    this.contextProcess = "build";
}

if (process.argv.includes("$dev_digest")) {
    console.log({context: "digest", contextProcess: "dev"})
    this.context = "digest";
    this.contextProcess = "dev";
}

let config = {
    build: {
        root: `./dist/`,
        html: `./dist/*.html`,
        css: `./dist/css`,
        js: `./dist/js`,
        img: `./dist/img`,
        pug: `./dist/`,
    },
    src: {
        pug: `./src/${this.context}/*.pug`,
        css: `./src/${this.context}/css/*.scss`,
        js: `./src/${this.context}/js/*.js`
    },
    watch: {
        pug: `./src/${this.context}/**/*.pug`,
        css: `./src/${this.context}/css/**/*.scss`,
        js: `./src/${this.context}/js/*.js`
    }
};

const buildConfig = {
    digest: {
        src: {
            pug: "./src/digest/current.pug",
            css: "./src/digest/css/styles.scss",
            js: "./src/digest/js/script.js"   
        }
    }
}

// это конфиг для build
config = {
    ...config,
    ...(this.contextProcess === "build" ? buildConfig[this.context] : null),
};


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

const buildInlineComponents = () => {
    return src(config.build.html)
        .pipe(styleInject())
        .pipe(inject(src([config.build.js + "/*.js"]), {
            starttag: '<!-- inject:script:js -->',
            removeTags: true,
            transform: function (filePath, file) {
                return `<script>${file.contents.toString('utf8')}</script>`;
            }
        }))
        .pipe(dest(config.build.root))
        .pipe(browserSync.stream());
}

const buildJS = () => {
    return src(config.src.js)
        .pipe(uglify())
        .pipe(dest(config.build.js))
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

const cleanBuildJsPath = () => {
    return src(config.build.js, { allowEmpty: true })
        .pipe(clean())
}


const $browserSync = () => {
    browserSync.init({
        server: {
            baseDir: config.build.root
        },
    });

    watch(config.watch.js, series(buildCSS, buildJS, buildPug, buildInlineComponents));
    watch(config.watch.css, series(buildCSS, buildJS, buildPug, buildInlineComponents));
    watch(config.watch.pug, series(buildCSS, buildJS, buildPug, buildInlineComponents));
}

const $dev = series(
    cleanRootPath,
    buildCSS,
    buildPug,
    buildJS,
    buildInlineComponents,
    parallel(
        $browserSync,
    )
)

const $build = series(
    cleanRootPath,
    buildCSS,
    buildPug,
    buildJS,
    buildInlineComponents,
    cleanBuildCssPath,
    cleanBuildJsPath,
)


exports.$dev_digest = $dev;
exports.$build_digest = $build;