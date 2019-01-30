const gulp = require('gulp')
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')
const uglify = require('gulp-uglify');
const pump = require('pump');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const prettify = require('gulp-html-prettify');
const concat = require('gulp-concat');
const stripDebug = require('gulp-strip-debug');
const wait = require('gulp-wait');

/* LEVANTE UN SERVER Y HACE WATCH DE CAMBIOS */
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: "./app"
    });

    gulp.watch("scss/**/*.scss", ['sass']);
    gulp.watch("templates/**/*.hbs", ['templates'])
    gulp.watch("js/**/*.js", ['copiaJS'])
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

/* COPIA LOS ARCHIVOS JS QUE EXISTAN */
gulp.task('copiaJS', function (cb) {
    pump([
            gulp.src('js/**/*.js'),
            gulp.dest('app/js/')
        ],
        cb
    );
});

/* TRANSPILA DE SASS A CSS */
gulp.task('sass', () => {
    return gulp.src('scss/main.scss')
        .pipe(wait(1500))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

/* TRANSPILA DE HBS A HTML */
gulp.task('templates', function () {

    var options = {
        ignorePartials: false, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
        batch : ['templates/partials']
    }
    return gulp.src('templates/*.hbs')
        .pipe(handlebars(null, options))
        .pipe(prettify({indent_char: ' ', indent_size: 2}))
        .pipe(rename(function (path) {
                path.extname = ".html"
            })
            )  
        .pipe(gulp.dest('app'));
})



/* MINIFICA LOS HTML */
gulp.task('minificarHTML', function() {
    return gulp.src('app/*.html')
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('app/'));
  });

gulp.task('minificarCSS', function (){
    
    return gulp.src('app/css/*.css')
    .pipe(cssnano())
    .pipe(rename(function (path) {
        path.extname = ".min.css"
    })
    )  
    .pipe(gulp.dest('app/css/'));
})


/* CONCATENA LOS ARCHIVOS JS QUE EXISTAN */
gulp.task('concat', function() {
    return gulp.src('app/js/*.js')
    .pipe(concat('main.min.js'))
    .pipe(stripDebug())
    .pipe(gulp.dest('app/js'));
})
  
/* COMPRIME EL ARCHIVO MINIFICADO */
gulp.task('comprimir', function (cb) {
    pump([
            gulp.src('app/js/main.min.js'),
            uglify(),
            gulp.dest('app/js/')
        ],
        cb
    );
});

gulp.task('comprimir2', function(){
    return gulp.src('app/js/main.min.js')
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
})

/* PARA BUILDEAR */
gulp.task('build', [ 'concat', 'comprimir' ]);