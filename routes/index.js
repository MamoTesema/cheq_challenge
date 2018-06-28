const express = require('express');
const xmlBuilder = require('xmlbuilder');
const router = express.Router();
const {connect, getRowById, putVast} = require('../lib/mysql');
const config = require('../config/default');

function validateFetchParams(query) {
    if(!query.id || isNaN(query.id)) {
      return 'id is invalid';
    }
}

/* GET home page. */

function getResponseData(DBresults = [], options = {}) {
    const xml = xmlBuilder.create('VAST').att('version','2.0');
    if(DBresults && DBresults.length > 0){
        xml.ele('Ad', {'id':'ComboGuard'});
        const inLine = xmlBuilder.create('InLine');
        inLine.ele('AdSystem','2.0');
        inLine.ele('Impression',options.impression);
        const creatives = xmlBuilder.create('Creatives');
        creatives.ele('Duration',options.duration)
            .ele('MediaFiles');
        DBresults.forEach(dbResult =>{
            const mediaFiles = creatives.ele('MediaFiles');
            mediaFiles.ele('MediaFile', dbResult.vast_url)
                .att('type', 'application/x-shockwave-flash')
                .att('apiFramework', 'VPAID')
                .att('height','168')
                .att('width', '298')
                .att('delivery', 'progressive');
        });
        inLine.importDocument(creatives);
        xml.importDocument(inLine);
    }
    return xml.end();
}

const fetchVast = async(req, res) => {
  const err = validateFetchParams(req.query);
  if(!err) {
      const connection = await connect();
      const result = await getRowById(connection, req.query.id);
      res.set('Content-Type', 'text/xml');
      let response;
      if(result.length > 0){
          response = getResponseData(result);
          res.send(response.toString());
      } else{

          res.send(getResponseData().toString());
      }
  } else {
    res.render('index', {title: err});
  }
};

createVast = async(req, res) => {
    const query = req.body;
    let resData;
    try {
        if (query.vastURL) {
            const connection = await connect();
            const result = await putVast(connection, query);
            resData = result.insertId;
        } else {
            resData = 'error';
        }
    } catch (ex) {
        console.error(ex.message);
        resData = ex.message;
    } finally {
        res.send(resData);
    }
};

module.exports = router;
router.get('/fetch_vast',fetchVast);
router.post('/create_vast',createVast);