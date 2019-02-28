sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/ComponentContainer',
    '<%= namepath %>/Component'
], function (jQuery, ComponentContainer, Component) {
    "use strict";

sap.ui.getCore().attachInit(function() {

      var oCompContainer = new ComponentContainer({
        height: "100%"
      })

      new sap.m.Shell({
        app: oCompContainer,
        showLogout: false,
        appWidthLimited: false
      }).placeAt("content");

      var oComponent = sap.ui.component({
        name: "<%= namespace %>",
        manifestFirst: true,
        async: true
      }).then(function(oComponent) {
        oCompContainer.setComponent(oComponent);
      });
    });
	
});