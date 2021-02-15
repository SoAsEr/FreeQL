const plugin = require('tailwindcss/plugin');
const defaultConfig = require('tailwindcss/defaultConfig');
const colors = require('tailwindcss/colors')
module.exports = {
    purge: [
      'src/**/*.js',
      'src/**/*.jsx',
      'src/**/*.ts',
      'src/**/*.tsx',
      'public/**/*.html',
    ],
    theme: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'select-dropdown': {'raw': '(min-height: 700px)'},
      },
      extend: {
        minWidth: defaultConfig.theme.spacing,
        minHeight: defaultConfig.theme.spacing,
        maxWidth: defaultConfig.theme.spacing,
        maxHeight: defaultConfig.theme.spacing,
      },
    },
    variants: {
      extend: {
        textColor:["children", "children-hover"],
        display: ["group-hover"],
        backgroundColor: ["disabled"],
        borderColor: ["disabled"],
        borderWidth: ["hover", "last", "first"],
        borderRadius: ["first", "last"],
        textColor: ["disabled"],
        cursor: ["disabled"],
        margin: ["important"],
        justifyContent: ["odd", "last"]
      }
    },
    plugins: [
      plugin(function({ addVariant }) {
        addVariant('important', ({ container }) => {
          container.walkRules(rule => {
            rule.selector = `.\\!${rule.selector.slice(1)}`
            rule.walkDecls(decl => {
              decl.important = true
            })
          })
        })
      }),
      require("tailwindcss-children")
    ],
  }
  