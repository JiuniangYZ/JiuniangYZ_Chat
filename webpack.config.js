var webpack=require('webpack')
var path = require('path')
const url = require('url')
var babelpolyfill = require("babel-polyfill");
function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports={
  //entry:"./src/main.js",
  entry:resolve('src/main.js'),
  node: {
    fs: 'empty',
    child_process:'empty',
  },
   output:{
      path: resolve('static2'),
      filename:"bundle.js",
   },
   module:{
      rules:[
         {
            test:/\.js$/,
            loader:"babel-loader",
            //include: resolve('./src/') ,
            //exclude: resolve('./node_modules') ,           
            query:{presets:['es2015']},
         },
         {
            test:/\.vue$/,
            loader:"vue-loader"
         },
         {
          test: /\.less$/,
          loader: 'style-loader!css-loader!less-loader'
         },
         {
          test: /\.css$/,
          loader: ['style-loader', 'css-loader'],
         },
         /**
         {
            test: /\.(png|jpe?g|gif|svg)$/,
            loader: 'file-loader'
         },
         **/
         {
           test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
           use: [{
             loader: 'url-loader?limit=5000',
             /** 
             options: {
               limit: 10000
             }
             **/
           }]
         }
      ]
   },
   resolve:{
      alias:{
         'vue$':'vue/dist/vue.js'
      }
   },
   plugins: [
      new webpack.ProvidePlugin({    // <added>
         jQuery: 'jquery',
         $: 'jquery',
         jquery: 'jquery'   // </added>
      })
      /**
      ,new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
      **/
    ]
};
