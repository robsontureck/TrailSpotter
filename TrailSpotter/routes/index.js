var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk');
require("dotenv").config();


// Initialize AWS SDK with credentials and region
AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
    region: 'ap-southeast-2',
});

const s3 = new AWS.S3();

const bucketName = 'trailspottercounter';
const objectKey = 'text.json';

const jsonData = {
    name: "TrailSpotter Counter",
    access: 0,
};

async function createS3bucket() {
    try {
        console.log(bucketName, jsonData);
        await s3.createBucket({ Bucket: bucketName }).promise()
        console.log(`Created bucket: ${bucketName}`);
        await uploadJsonToS3(jsonData);
    } catch (err) {
        if (err.statusCode === 409) {
            console.log(`Bucket already exists: ${bucketName}`);
        } else {
            console.log(`Error creating bucket: ${err}`);
        }
    }
}

async function uploadJsonToS3(updatedData) {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
        Body: JSON.stringify(updatedData),
        ContentType: "application/json",
    };

    try {
        await s3.putObject(params).promise();
        console.log("JSON file uploaded successfully.")
    } catch (err) {
        console.error("Error uploading JSON file:", err);
    }
}

async function getObjectFromS3() {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
    };

    try {
        const data = await s3.getObject(params).promise();
        const parsedData = JSON.parse(data.Body.toString("utf-8"));
        console.log("Parsed JSON data:", parsedData);
        parsedData.access++;
        console.log("Parsed JSON data:", parsedData);
        await uploadJsonToS3(parsedData);
        return parsedData.access;
    } catch (err) {
        console.log("Error:", err);
    }
}

/* GET home page. */
router.get('/', function (req, res, next) {
    (async () => {
        await createS3bucket();
        const counter = await getObjectFromS3();
        res.render('index', { title: 'TrailHub', accessCount: counter });
    })();

});

module.exports = router;