// Refino do cabelo: borda do contorno + Preenchimento generativo, em 3 faixas
#target photoshop
function s2t(s){return stringIDToTypeID(s)} function c2t(c){return charIDToTypeID(c)}
var log=[];
function selecionarAssunto(){var d=new ActionDescriptor();d.putBoolean(s2t("sampleAllLayers"),false);executeAction(s2t("autoCutout"),d,DialogModes.NO)}
function borda(px){var d=new ActionDescriptor();d.putUnitDouble(c2t("Wdth"),c2t("#Pxl"),px);executeAction(c2t("Brdr"),d,DialogModes.NO)}
function genFill(prompt){
  var d=new ActionDescriptor(),r=new ActionReference();
  r.putEnumerated(s2t("document"),s2t("ordinal"),s2t("targetEnum"));d.putReference(s2t("null"),r);
  d.putString(s2t("prompt"),prompt);d.putString(s2t("serviceID"),"clio");
  d.putEnumerated(s2t("mode"),s2t("syntheticFillMode"),s2t("inpaint"));
  var o=new ActionDescriptor();o.putString(s2t("gi_PROMPT"),prompt);o.putString(s2t("gi_MODE"),"ginp");o.putInteger(s2t("gi_SEED"),-1);
  o.putInteger(s2t("gi_NUM_STEPS"),-1);o.putInteger(s2t("gi_GUIDANCE"),6);o.putInteger(s2t("gi_SIMILARITY"),0);o.putBoolean(s2t("gi_CROP"),false);
  o.putBoolean(s2t("gi_DILATE"),false);o.putInteger(s2t("gi_CONTENT_PRESERVE"),0);o.putBoolean(s2t("gi_ENABLE_PROMPT_FILTER"),true);o.putBoolean(s2t("dualCrop"),true);
  o.putString(s2t("gi_ADVANCED"),'{"enable_mts":true}');
  var w=new ActionDescriptor();w.putObject(s2t("clio"),s2t("clio"),o);d.putObject(s2t("serviceOptionsList"),s2t("target"),w);
  executeAction(s2t("syntheticFill"),d,DialogModes.NO)
}
var doc=app.activeDocument; app.preferences.rulerUnits=Units.PIXELS;
var W=doc.width.as("px"), H=doc.height.as("px");
var faixas=[[0,1180],[1080,2160],[2060,W]];
for(var i=0;i<faixas.length;i++){
  try{
    doc.activeLayer=doc.layers[doc.layers.length-1];
    selecionarAssunto(); borda(30);
    var x0=faixas[i][0],x1=faixas[i][1],y0=150,y1=1350;
    doc.selection.select([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],SelectionType.INTERSECT);
    genFill("natural soft hair strands, black and white photo, clean white background");
    log.push("faixa "+i+" ok, camadas="+doc.layers.length);
  }catch(e){log.push("faixa "+i+" erro: "+e)}
}
doc.selection.deselect();
log.join(" | ");
