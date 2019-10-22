const { AudioNotFound } = require('../errorCodes');
const AWS = require('aws-sdk');

const client = new AWS.S3();

const handleStream = (req, res) => {
	const { entryID } = req.body;
	const params = {
	    Bucket: 'cantotalk-audio-clips',
	    Key: `entryID_${entryID}.mp3`
	}
	const downloadStream = client.downloadStream(params)

	downloadStream.on('error', function() {
	  res.send(new AudioNotFound());
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