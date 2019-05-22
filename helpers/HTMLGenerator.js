const path = require('path');
const ejs = require('ejs-promise');

async function generateHTML(template, params) {
   const file = path.join(__dirname, `../templates/${template}.ejs`);

   if (!file) {
      throw new Error(`Could not find the ${template} in path ${file}`);
   }

   return await ejs.renderFile(file, params, {}, (error, result) => {
      if (error) {
         return error;
      }
      return result
         .then(function (data) {
            return data;
         })
         .catch((error) => {
            throw error;
         });
   });
}

module.exports = {
  generateHTML
}