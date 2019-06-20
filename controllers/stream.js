const { validateEmail, sendMail } = require('../helpers/utils');
const s3 = require('s3');


const client = s3.createClient({  
  s3Options: {
    accessKeyId: 'AKIAJ2BF62TKDGACU4RA',
    secretAccessKey: <YOUR SECRET KEY>
  }
});

const handleStream = (req, res) => {
	const params = {
	    Bucket: 'New-Bucket-1020',
	    Key: 'test.mp3'
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

	// Pipe download stream to response
	downloadStream.pipe(res);
}


module.exports = {
	handleStream,
}