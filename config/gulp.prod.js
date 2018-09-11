/**
 * gulp 生产环境
 * prod build：
 *  1. 文件压缩 - 针对js、css、img分别进行uglify, minify, compress
 *  2. 加版本号 - 加hash编码，并自动替换原始路径
 */

const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const rev = require('gulp-rev') // 文件名加md5后缀
const revCollector = require('gulp-rev-collector')
const stylus = require('gulp-stylus')
const autoprefixer = require('gulp-autoprefixer')
const minifyCss = require('gulp-minify-css')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const config = require('./gulp.config.js')
const del = require('del')
const gulpSequence = require('gulp-sequence') // 顺序执行gulp任务流

function prod() {
  /**
   * 打包前清除dist文件夹
   */
  gulp.task('clean', () => {
    del([ './dist' ])
  })

  /**
   * HTML处理
   */
  gulp.task('html:prod', function () {
    return gulp.src(['dist/**/*.json', config.html.src])
    .pipe(revCollector({
      replaceReved: true
    }))
    .pipe(htmlmin({
      minifyCSS: true,
      minifyJS: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.html.dist))
  })

  /**
   * assets文件夹下的所有文件处理
   */
  gulp.task('assets:prod', function () {
    return gulp.src(config.assets.src).pipe(gulp.dest(config.assets.dist))
  })

  /**
   * CSS样式处理
   * 加浏览器前缀
   * 压缩
   * 更名
   */
  gulp.task('css:prod', function () {
    return gulp.src(config.css.src)
    .pipe(autoprefixer('last 2 version'))
    .pipe(minifyCss()) // 压缩
    .pipe(rev())
    .pipe(gulp.dest(config.css.dist))
    .pipe(rev.manifest('lib.manifest.json'))
    .pipe(gulp.dest(config.css.dist))
  })

  /**
   * stylus样式处理
   */
  gulp.task('stylus:prod', function () {
    return gulp.src(['dist/images/*.json', config.stylus.src])
    .pipe(revCollector({
      replaceReved: true
    }))
    .pipe(stylus())
    .pipe(autoprefixer('last 2 version'))
    .pipe(minifyCss()) // 压缩
    .pipe(rev())
    .pipe(gulp.dest(config.stylus.dist))
    .pipe(rev.manifest('css.manifest.json'))
    .pipe(gulp.dest(config.stylus.dist))
  })

  /**
   * js处理：合并、压缩
   */
  gulp.task('js:prod', function () {
    return gulp.src(config.js.src)
    .pipe(eslint()).pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel())
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(config.js.dist))
    .pipe(rev.manifest('js.manifest.json'))
    .pipe(gulp.dest(config.js.dist))
  })

  /**
   * 图片处理
   */
  gulp.task('images:prod', function () {
    return gulp.src(config.img.src).pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(rev())
    .pipe(gulp.dest(config.img.dist))
    .pipe(rev.manifest('images.manifest.json'))
    .pipe(gulp.dest(config.img.dist))
  })

  gulp.task('prod', gulpSequence('clean', 'images:prod', 'css:prod', 'stylus:prod', 'js:prod', 'assets:prod', 'html:prod'))
}

module.exports = prod
