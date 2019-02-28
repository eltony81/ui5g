/*global QUnit*/

  import ResourceModel from "sap/ui/model/resource/ResourceModel";
  import sinon from "sap/ui/thirdparty/sinon";
  import sinon_qunit from "sap/ui/thirdparty/sinon-qunit";
  
  import formatter from "<%= namepath %>/model/formatter";

  QUnit.module("Formatting functions", {
    setup: function() {
      this._oResourceModel = new ResourceModel({
        bundleUrl: jQuery.sap.getModulePath("<%= namespace %>", "/i18n/i18n.properties")
      });
    },
    teardown: function() {
      this._oResourceModel.destroy();
    }
  });


  QUnit.test("Should return the translated texts", function(assert) {

			// Arrange
    var oViewStub = {
      getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
    };
    var oControllerStub = {
      getView: this.stub().returns(oViewStub)
    };

			// System under test
    var fnIsolatedFormatter = formatter.statusText.bind(oControllerStub);

			// Assert
    assert.strictEqual(fnIsolatedFormatter("A"), "New", "The long text for status A is correct");

    assert.strictEqual(fnIsolatedFormatter("B"), "In Progress", "The long text for status B is correct");

    assert.strictEqual(fnIsolatedFormatter("C"), "Done", "The long text for status C is correct");

    assert.strictEqual(fnIsolatedFormatter("Foo"), "Foo", "The long text for status Foo is correct");
  });


