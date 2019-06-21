const { validateEmail, sendMail } = require('../helpers/utils');
const s3Key = process.env.S3_KEY;
const s3Secret = process.env.S3_SECRET;
const s3 = require('s3');


const client = s3.createClient({  
  s3Options: {
    accessKeyId: s3Key,
    secretAccessKey: s3Secret
  }
});

const handleStream = (req, res) => {
	const params = {
	    Bucket: 'cantotalk-audio-clips',
	    Key: 'entryID_1.mp3'
	}
	const downloadStream = client.downloadStream(params)

	downloadStream.on('error', function() {
	  res.status(404).send('Not Found');
	});

	downloadStream.on('httpHeaders', function(statusCode, headers, resp) {
	  res.set({
	    'Content-Type': headers['content-type']
	  });
	})

	downloadStream.pipe(res);
}


module.exports = {
	handleStream,
}