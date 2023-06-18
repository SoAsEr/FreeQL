const { supsubregex, subregex, wordRegex } = require("./chemicalRegexes");

const getWords = (matches) =>
  matches.reduce((prev, match) => {
    const wordPieces = Array.from(
      match.groups.WordMatcher.matchAll(wordRegex)
    ).map((a) => a[0]);
    wordPieces[wordPieces.length - 1] += match.groups.EndBlockMatcher ?? "";
    return [...prev, ...wordPieces];
  }, []);

describe("main parser", () => {
  describe("simples", () => {
    test("nothing", () => {
      const matches = Array.from("ABCD".matchAll(supsubregex));
      expect(matches[0].groups.WordMatcher).toBe("ABCD");
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("ABCD");
    });
    test("tests basic subscript", () => {
      const matches = Array.from("CO2".matchAll(supsubregex));
      expect(matches[0].groups.WordMatcher).toBe("CO");
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("CO");
      const subMatches = Array.from(
        matches[0].groups.SubMatcher.matchAll(subregex)
      );
      expect(subMatches[0][2]).toBe("2");
    });
    test("tests long subscript", () => {
      const matches = Array.from("CO12".matchAll(supsubregex));
      expect(matches[0].groups.WordMatcher).toBe("CO");
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("CO");
      const subMatches = Array.from(
        matches[0].groups.SubMatcher.matchAll(subregex)
      );
      expect(subMatches[0][2]).toBe("12");
    });
    describe.each([
      ["-", ""],
      ["-", "1"],
      ["-", "12"],
      ["+", ""],
      ["+", "1"],
      ["+", "12"],
    ])("basic charge %s%s", (chargeSign, chargeValue) => {
      const matches = Array.from(
        `CO${chargeSign}${chargeValue}`.matchAll(supsubregex)
      );
      test("word matches", () => {
        expect(matches[0].groups.WordMatcher).toBe("CO");
        const wordmatches = Array.from(
          matches[0].groups.WordMatcher.matchAll(wordRegex)
        ).map((a) => a[0]);
        expect(wordmatches[0]).toBe("CO");
      });
      test("charge and value match", () => {
        expect(matches[0].groups.ChargeSign).toBe(chargeSign);
        if (chargeValue !== "") {
          expect(matches[0].groups.ChargeValue).toBe(chargeValue);
        }
      });
    });
  });
  describe("block creation", () => {
    test("tests long element block creation", () => {
      const matches = Array.from("CaH2".matchAll(supsubregex));
      expect(matches[0].groups.WordMatcher).toBe("CaH");
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("Ca");
      expect(wordmatches[1]).toBe("H");
      const subMatches = Array.from(
        matches[0].groups.SubMatcher.matchAll(subregex)
      );
      expect(subMatches[0][2]).toBe("2");
    });
    test("tests block opening paren", () => {
      const matches = Array.from("Cr(OH)2".matchAll(supsubregex));
      expect(matches[0].groups.WordMatcher).toBe("Cr(OH");
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("Cr");
      expect(wordmatches[1]).toBe("(OH");
      const subMatches = Array.from(
        matches[0].groups.SubMatcher.matchAll(subregex)
      );
      expect(subMatches[0][1]).toBe(")");
      expect(subMatches[0][2]).toBe("2");
    });
    test("tests block repeated paren with opening number", () => {
      const matches = Array.from("Cr[A(Ca(SCNCe2)2]2".matchAll(supsubregex));
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("Cr");
      expect(wordmatches[1]).toBe("[A(Ca");
      expect(wordmatches[2]).toBe("(SCN");
      expect(wordmatches[3]).toBe("Ce");
      const subMatches = Array.from(
        matches[0].groups.SubMatcher.matchAll(subregex)
      );
      expect(subMatches[0][1]).toBe(undefined);
      expect(subMatches[0][2]).toBe("2");
      expect(subMatches[1][1]).toBe(")");
      expect(subMatches[1][2]).toBe("2");
      expect(subMatches[2][1]).toBe("]");
      expect(subMatches[2][2]).toBe("2");
    });
    test("tests block repeated paren without opening number", () => {
      const matches = Array.from("Cr(Ca(OHCe)2)2".matchAll(supsubregex));
      const wordmatches = Array.from(
        matches[0].groups.WordMatcher.matchAll(wordRegex)
      ).map((a) => a[0]);
      expect(wordmatches[0]).toBe("Cr");
      expect(wordmatches[1]).toBe("(Ca");
      expect(wordmatches[2]).toBe("(OH");
      expect(wordmatches[3]).toBe("Ce");
      expect(matches[0].groups.SubMatcher).toBe(")2)2");
      const subMatches = Array.from(
        matches[0].groups.SubMatcher.matchAll(subregex)
      );
      expect(subMatches[0][1]).toBe(")");
      expect(subMatches[0][2]).toBe("2");
      expect(subMatches[1][1]).toBe(")");
      expect(subMatches[1][2]).toBe("2");
    });
    test("tests block with hyphen with (", () => {
      const matches = Array.from("H-(Citrate)".matchAll(supsubregex));
      const words = getWords(matches);
      expect(words[0]).toBe("H-");
      expect(words[1]).toBe("(Citrate)");
    });
    test("tests block with hyphen no (", () => {
      const matches = Array.from("AB-CD".matchAll(supsubregex));
      const words = getWords(matches);
      expect(words[0]).toBe("AB-");
      expect(words[1]).toBe("CD");
    });
    test("tests block with hypen at the end of number string", () => {
      const matches = Array.from("22-Podzol".matchAll(supsubregex));
      const words = getWords(matches);
      expect(words[0]).toBe("22-");
      expect(words[1]).toBe("Podzol");
    });
    describe.each([
      ["-", ""],
      ["-", "1"],
      ["-", "12"],
      ["+", ""],
      ["+", "1"],
      ["+", "12"],
    ])(
      "tests block with charge of %s%s and numbering at end of name ",
      (chargeSign, chargeValue) => {
        const matches = Array.from(
          `HFA${chargeSign}${chargeValue}(10)`.matchAll(supsubregex)
        );
        test("block doesn't absorb hyphen", () => {
          expect(matches[0].groups.WordMatcher).toBe("HFA");
          expect(matches[0].groups.EndBlockMatcher).toBe(undefined);
        });
        test("Charge properly captured", () => {
          expect(matches[0].groups.ChargeSign).toBe(chargeSign);
          if (chargeValue !== "") {
            expect(matches[0].groups.ChargeValue).toBe(chargeValue);
          }
        });
      }
    );
  });
  test("begins with number", () => {
    const matches = Array.from("2Podzol".matchAll(supsubregex));
    expect(matches[0].groups.WordMatcher).toBe("2Podzol");
  });
  describe.each([" ", ",", ":", ".", "/"])("EndMatcher '%s'", (end) => {
    test("interacts with charge ends properly", () => {
      const matches = Array.from(
        `DOM2-2${end}DOM2-${end}DOM-${end}END`.matchAll(supsubregex)
      );
      expect(matches[0].groups.WordMatcher).toBe("DOM");
      expect(matches[0].groups.SubMatcher).toBe("2");
      expect(matches[0].groups.ChargeSign).toBe("-");
      expect(matches[0].groups.ChargeValue).toBe("2");
      expect(matches[1].groups.WordMatcher).toBe("DOM");
      expect(matches[1].groups.SubMatcher).toBe("2");
      expect(matches[1].groups.ChargeSign).toBe("-");
      expect(matches[2].groups.WordMatcher).toBe("DOM");
      expect(matches[2].groups.ChargeSign).toBe("-");
      expect(matches[3].groups.WordMatcher).toBe("END");
    });
    test("ends subs and words properly", () => {
      const matches = Array.from(
        `Methyl2${end}Ce${end}END`.matchAll(supsubregex)
      );
      expect(matches[0].groups.WordMatcher).toBe("Methyl");
      expect(matches[0].groups.SubMatcher).toBe("2");
      expect(matches[1].groups.WordMatcher).toBe("Ce");
      expect(matches[2].groups.WordMatcher).toBe("END");
    });
  });
});
