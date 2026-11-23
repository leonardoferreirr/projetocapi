#target photoshop
var doc=app.activeDocument;
var psd=new PhotoshopSaveOptions(); psd.layers=true;
doc.saveAs(new File("/Users/Leonardo/dev/projetocapi/tools/fonte/ps/grupo-refino.psd"),psd,true);
var j=new JPEGSaveOptions(); j.quality=11; j.embedColorProfile=true;
doc.saveAs(new File("/Users/Leonardo/dev/projetocapi/tools/fonte/ps/grupo-refino.jpg"),j,true);
"salvo "+doc.layers.length+" camadas";
