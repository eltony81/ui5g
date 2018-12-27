sap.ui.getCore().attachInit(function() {

  var oCompContainer = new sap.ui.core.ComponentContainer({
    height: "100%"
  })

  new sap.m.Shell({
    app: oCompContainer,
    showLogout: true,
    appWidthLimited: true
  }).placeAt("content");

  var oComponent = sap.ui.component({
    name: "<%= namespace %>",
    manifestFirst: true,
    async: true
  }).then(function(oComponent) {
    oCompContainer.setComponent(oComponent);
  });

});
