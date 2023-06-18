const { _ } = require("ajv/dist/compile/codegen");

module.exports = function (ajv) {
  ajv.addKeyword({
    keyword: "replacement",
    type: "string",
    schemaType: "object",
    $data: "true",
    code(cxt) {
      const { data, schemaCode } = cxt;
      cxt.fail$data(_`${schemaCode}[${data}]>1`);
    },
    error: { message: "component replaced more than once" },
  });
  ajv.addKeyword({
    keyword: "is-number",
    type: "string",
    schemaType: "boolean",
    code(cxt) {
      const { data, schema } = cxt;
      cxt.fail(
        _`(${data}.trim()==="" || !Number.isFinite(Number(${data}))) === ${schema}`
      );
    },
    error: { message: "invalid number" },
  });
};
