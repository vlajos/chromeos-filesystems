// Copyright 2014 The Chromium Authors. All rights reserved.

// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd

/* jshint -W027 */

'use strict';

module.exports = function(onReadFileRequested, onOpenFileRequested) {
  describe('onReadFileRequested', function() {
    it('should fail for files that have not been opened yet', function(done) {
      var options = {
        openRequestId: 1,
        filePath: '/1.txt'
      };

      var onSuccess = function(contents, hasMore) {
        throw new Error('Should have rejected file read.');
        done();
      };

      var onError = function(error) {
        error.should.be.a('string');
        error.should.equal('INVALID_OPERATION');
        done();
      };

      onReadFileRequested(options, onSuccess, onError);
    });

    it('should return the correct contents for an opened file', function(done) {
      var options = {
        filePath: '/1.txt',
        mode: 'READ',
        create: false,
        requestId: 1
      };

      var expected = '1';

      var onOpenSuccess = function() {
        var options = {
          length: 512,
          offset: 0,
          openRequestId: 1
        };

        var onReadSuccess = function(contents, hasMore) {
          contents.should.be.an.instanceof(ArrayBuffer);

          contents.byteLength.should.equal(1);

          var string = arrayBufferToString(contents);
          string.substring(0, 6).should.equal(expected);

          done();
        };

        var onReadError = function(error) {
          throw new Error(error);
        };

        onReadFileRequested(options, onReadSuccess, onReadError);
      };

      var onOpenError = function(error) {
        throw new Error(error);
      };

      onOpenFileRequested(options, onOpenSuccess, onOpenError);
    });

    it('should work for files larger than the chunk size of 512kb',
      function(done) {
        // Downloads a 4 megabyte text file filled with 1s.
        var options = {
          filePath: '/big.txt',
          mode: 'READ',
          create: false,
          requestId: 2
        };

        var onOpenSuccess = function() {
          var options = {
            length: 512,
            offset: 0,
            openRequestId: 2
          };

          var onReadSuccess = function(contents, hasMore) {
            contents.should.be.an.instanceof(ArrayBuffer);

            contents.byteLength.should.equal(512);

            var string = arrayBufferToString(contents);
            string.should.equal(new Array(513).join('1'));

            done();
          };

          var onReadError = function(error) {
            throw new Error(error);
          };

          onReadFileRequested(options, onReadSuccess, onReadError);
        };

        var onOpenError = function(error) {
          throw new Error(error);
        };

        onOpenFileRequested(options, onOpenSuccess, onOpenError);
    });
  });
};
