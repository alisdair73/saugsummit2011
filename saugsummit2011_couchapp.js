var couchapp = require('couchapp');
var path = require('path');

ddoc = { _id: '_design/app',
         views: {},
         lists: {},
         shows: {}
       }

module.exports = ddoc;

ddoc.validate_doc_update = function(new_doc,old_doc,userCtx){
  if(!userCtx.name){
    throw({forbidden:"Please log in first."});
  }
}

ddoc.views.byDate = {

  map: function(doc){
         emit(doc.session.formattedDate,doc);
       }

}

ddoc.views.sessionDays = {
  map: function(doc){
    emit(doc.session.formattedDate,1);
  },
  
  reduce : '_count'

}


ddoc.views.findSessionByKeyword = {

  map: function(doc){
    
    var sessionDetail = doc.session.sessionDetail;

    var wordList = [];
    wordList = sessionDetail.split(" ");
    wordList.forEach(function(word){
      emit(word,doc);
    });
  }
}

ddoc.views.wordCount = {

  map: function(doc){

    var sessionDetail = doc.session.sessionDetail;

    var wordList = [];
    wordList = sessionDetail.split(" ");
    wordList.forEach(function(word){
      emit(word,1);
    });
  },

  reduce: '_count'
}

ddoc.lists.sortWordCount = function(head,req){

  var list = [];

  while(row = getRow()){
    var item;
    item.key = row.key;
    item.value = row.value;
    list.push(item);
  }

  list.sort(function(a,b){
    return a.value - b.value; 
  });

  send( list );

}

ddoc.shows.showSessionDetail = function(doc,res){

  var html = '<div data-role="page" id="details" data-add-back-btn="true">' + 
               '<div data-role="header" id="header" data-position="inline" data-theme="b">' +
                 '<h1>Session Details</h1>' +
               '</div>' +
               '<div data-role="content" data-theme="b">' +
//                 '<img src="http://saugsummit2011.iriscouch.com/saugsummit2011/_design/app/masthead.jpg" width="100%"/>' +
                 '<h2>' + doc.session.sessionName + '</h2>';
                 
  if (doc.session.presenters){  
    
    html = html + '<p>Presented By:</p><ul>';
  
    doc.session.presenters.forEach(function(presenter){
      html = html + '<li>' + presenter + '</li>';  
    });
    
    html = html + '</ul>';
  }

//  html = html + '<p>Details:</p>';
  html = html + doc.session.sessionDetail;
  
  html = html + '</div></div>';
            
  return { body: html }            
}

couchapp.loadAttachments(ddoc, path.join(__dirname, '_attachments'));
