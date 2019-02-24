//This has NOT been tested on IAUX but should be moveable to IAUX just by switching the commented headers below -
//IAUX version
//import React from 'react'
//import IAReactComponent from 'iacomponents/experimental/IAReactComponent';
//import PropTypes from 'prop-types'
//!IAUX version
import React from "../ReactFake";
import IAReactComponent from './IAReactComponent';
require('../BookReaderJSIA.js'); const BookReaderJSIA = window.BookReaderJSIA; // copied BookReaderJSIA puts it at "window" level (TODO-BOOK confirm)
require('@internetarchive/bookreader'); // Also appears to set as global variable (TODO-BOOK confirm)

export default class BookReaderWrap extends IAReactComponent {
    /* Used in IAUX, but not in ReactFake
    static propTypes = { //TODO-BOOK check this after call
        identifier: PropTypes.string.isRequired,
        item: PropTypes.object.isRequired, //ArchiveItem
    };
    */
    constructor(props) { //TODO-BOOK maybe pass in ArchiveItem
        super(props);
        if (this.props.item) this.props.identifier = this.props.item.itemid;
    }
    loadcallable(enclosingElement) {
        var options = { //TODO-BOOK edit these
            el: '#BookReader',
            mobileNavFullscreenOnly: true,
            urlHistoryBasePath: `\/details\/${this.props.identifier}\/`,
            resumeCookiePath: `\/details\/${this.props.identifier}`,
            urlMode: 'history',
            // Only reflect page onto the URL
            urlTrackedParams: ['page'],
            enableBookTitleLink: false,
            bookUrlText: null,
            initialSearchTerm: null,
            onePage: {autofit: "auto"}
        };
        const item = this.props.item;
        const identifier = this.props.identifier;
        //TODO-BOOK this line will evolve as work thru steps
        const url='https://${item.server}/BookReader/BookReaderJSIA.php?id=${identifier}&itemPath=${item.dir}&server=${item.server}&format=jsonp&subPrefix=${identifier}&requestUri=/details/${identifier}',
        DwebTransports.httptools.p_GET(url, {}, (err, res) {
            // Load Bookreader data async
            BookReaderJSIAinit(res, options);
            // Usage stats
            window.archive_analytics.values['bookreader'] = 'open';
        }
    }

    render() { return (
        // Code as cut and paste from https://archive.org/details/unitednov65unit/page/n5 on 2019-02-24
        //TODO-BOOK put loading into one of these and see which overwritten
        <div id="IABookReaderWrapper" ref={this.load}>
            <div id="IABookReaderMessageWrapper" style="display:none;"></div>
            <div id="BookReader" className="BookReader"></div>
        </div> )
    }
}


/*

* Strategy
    * --- next step ---
      * Trivial component
          * Call regular server
            * [DONE] Edit url to use server,dir
          * [DONE] Pass to BookReaderJSIAinit
          * [DONE] Probably needs BookReaderJSIAinit and Bookreader in globals as thats what (unmodified) code does
      * [DONE] Call from Texts.js
      * [ ] Test
*/
/*
    * --- following step ---
    * In Text.js
       * if usesBookReader
            fetch_bookdata
            load component
    * In component
        * fetch_metadata
        * Then fetch bookdata (url ?)
        * Pass to BookReaderJSIAinit
    * Fetch bookdata (assumes done fetch_metadata)
        * THEN fetch_bookdata(metadata) from dweb.me or localhost
    * localhost/xxxx
        * if have locally
            * add metadata back into datastructure and return
        * else
            * forward to dweb.me
            * cache result minus the metadata field
            * edit result to turn https://dweb.me into http://localhost:4244/
            * OR find code fetching dweb.me and intercept there (better as allows IPFS intercept as well)
    * dweb.me/xxxxx
        * construct url from metadata d1,d2,dir
          * set server=dweb.me
          * edit result to turn https://dweb.me into http://localhost:4244/
    * Intercept https://ia801600.us.archive.org/BookReader/BookReaderImages.php?zip=/27/items/unitednov65unit/unitednov65unit_jp2.zip&file=unitednov65unit_jp2/unitednov65unit_0001.jp2&scale=4&rotate=0
      * Mirror:/Bookreader/BookReaderImages.php
        * If have file then return
        * If have the .zip then extract file and return
        * else forward request for file to dweb.me and cache
      * Dweb.me: /Bookreader/BookReaderImages.php
        * Call actual server for page (use metadata to find server), push url into ipfs to get from dweb.me
    * Crawl:
        * metadata gets the json (fetch_metadata)
        * Details gets the zip
        * All gets all files (as now)
    * function usesBookreader(metadata)
    * = true if mediatype=texts && has abby and pdf files
    * put bookreader/BookReader/images/* into app ?
  * Future:
    * dweb.me add ipfs etc to urls in brOptions/data as push into IPFS.
    * bookreader code to see that url when sees the dweb.me one (maybe not that hard)
*/
