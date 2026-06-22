export const SAMPLE_SBML = `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version1/core"
      xmlns:layout="http://www.sbml.org/sbml/level3/version1/layout/version1"
      xmlns:qual="http://www.sbml.org/sbml/level3/version1/qual/version1"
      level="3"
      version="1"
      layout:required="false"
      qual:required="true">
  <model id="sample_model" metaid="_sample_model">
    <notes>
      <body xmlns="http://www.w3.org/1999/xhtml">
        <p>Sample model notes.</p>
      </body>
    </notes>
    <annotation>
      <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:bqbiol="http://biomodels.net/biology-qualifiers/">
        <rdf:Description rdf:about="#_sample_model">
          <bqbiol:unknownQualifier>
            <rdf:Bag>
              <rdf:li rdf:resource="https://pubmed.ncbi.nlm.nih.gov/36514338/"/>
            </rdf:Bag>
          </bqbiol:unknownQualifier>
        </rdf:Description>
      </rdf:RDF>
    </annotation>
    <layout:listOfLayouts>
      <layout:layout layout:id="__layout__">
        <layout:dimensions layout:width="500" layout:height="300"/>
        <layout:listOfAdditionalGraphicalObjects>
          <layout:generalGlyph layout:id="_ly_RA" layout:reference="RA">
            <layout:boundingBox>
              <layout:position layout:x="20" layout:y="30"/>
              <layout:dimensions layout:width="120" layout:height="45"/>
            </layout:boundingBox>
          </layout:generalGlyph>
          <layout:generalGlyph layout:id="_ly_RARA" layout:reference="RARA">
            <layout:boundingBox>
              <layout:position layout:x="220" layout:y="30"/>
              <layout:dimensions layout:width="120" layout:height="45"/>
            </layout:boundingBox>
          </layout:generalGlyph>
          <layout:generalGlyph layout:id="_ly_PML_RARA" layout:reference="PML_RARA">
            <layout:boundingBox>
              <layout:position layout:x="20" layout:y="170"/>
              <layout:dimensions layout:width="120" layout:height="45"/>
            </layout:boundingBox>
          </layout:generalGlyph>
          <layout:generalGlyph layout:id="_ly_SPI1" layout:reference="SPI1">
            <layout:boundingBox>
              <layout:position layout:x="220" layout:y="170"/>
              <layout:dimensions layout:width="120" layout:height="45"/>
            </layout:boundingBox>
          </layout:generalGlyph>
        </layout:listOfAdditionalGraphicalObjects>
      </layout:layout>
    </layout:listOfLayouts>
    <qual:listOfQualitativeSpecies>
      <qual:qualitativeSpecies metaid="_ra" qual:id="RA" qual:name="Retinoic Acid" qual:compartment="comp1" qual:constant="true" qual:maxLevel="2">
        <notes>
          <body xmlns="http://www.w3.org/1999/xhtml">
            <p>RA note.</p>
          </body>
        </notes>
        <annotation>
          <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:bqbiol="http://biomodels.net/biology-qualifiers/">
            <rdf:Description rdf:about="#_ra">
              <bqbiol:unknownQualifier>
                <rdf:Bag>
                  <rdf:li rdf:resource="https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:15367"/>
                </rdf:Bag>
              </bqbiol:unknownQualifier>
            </rdf:Description>
          </rdf:RDF>
        </annotation>
      </qual:qualitativeSpecies>
      <qual:qualitativeSpecies metaid="_rara" qual:id="RARA" qual:name="Retinoic Acid Receptor" qual:compartment="comp1" qual:constant="false" qual:maxLevel="1"/>
      <qual:qualitativeSpecies metaid="_pml_rara" qual:id="PML_RARA" qual:name="PML::RARA fusion protein" qual:compartment="comp1" qual:constant="false" qual:maxLevel="1"/>
      <qual:qualitativeSpecies metaid="_spi1" qual:id="SPI1" qual:name="SPI1" qual:compartment="comp1" qual:constant="false" qual:maxLevel="1">
        <notes>
          <body xmlns="http://www.w3.org/1999/xhtml">
            <p>SPI1 note.</p>
          </body>
        </notes>
      </qual:qualitativeSpecies>
    </qual:listOfQualitativeSpecies>
    <qual:listOfTransitions>
      <qual:transition qual:id="tr_RARA_">
        <qual:listOfOutputs>
          <qual:output qual:id="tr_RARA_out" qual:qualitativeSpecies="RARA" qual:transitionEffect="assignmentLevel"/>
        </qual:listOfOutputs>
        <qual:listOfFunctionTerms>
          <qual:defaultTerm qual:resultLevel="1"/>
        </qual:listOfFunctionTerms>
      </qual:transition>
      <qual:transition qual:id="tr_SPI1_">
        <qual:listOfInputs>
          <qual:input metaid="_edge_ra_spi1" qual:id="tr_SPI1_in_1" qual:qualitativeSpecies="RA" qual:sign="positive" qual:transitionEffect="none" qual:thresholdLevel="1">
            <notes>
              <body xmlns="http://www.w3.org/1999/xhtml">
                <p>Edge from RA to SPI1.</p>
              </body>
            </notes>
            <annotation>
              <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:bqbiol="http://biomodels.net/biology-qualifiers/">
                <rdf:Description rdf:about="#_edge_ra_spi1">
                  <bqbiol:unknownQualifier>
                    <rdf:Bag>
                      <rdf:li rdf:resource="https://example.org/edge/ra-spi1"/>
                    </rdf:Bag>
                  </bqbiol:unknownQualifier>
                </rdf:Description>
              </rdf:RDF>
            </annotation>
          </qual:input>
          <qual:input metaid="_edge_rara_spi1" qual:id="tr_SPI1_in_2" qual:qualitativeSpecies="RARA" qual:sign="positive" qual:transitionEffect="none" qual:thresholdLevel="1"/>
          <qual:input metaid="_edge_pml_rara_spi1" qual:id="tr_SPI1_in_3" qual:qualitativeSpecies="PML_RARA" qual:sign="negative" qual:transitionEffect="none" qual:thresholdLevel="1"/>
        </qual:listOfInputs>
        <qual:listOfOutputs>
          <qual:output qual:id="tr_SPI1_out" qual:qualitativeSpecies="SPI1" qual:transitionEffect="assignmentLevel"/>
        </qual:listOfOutputs>
        <qual:listOfFunctionTerms>
          <qual:defaultTerm qual:resultLevel="0"/>
          <qual:functionTerm qual:resultLevel="1">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <apply>
                <and/>
                <apply>
                  <geq/>
                  <ci> RA </ci>
                  <cn type="integer"> 1 </cn>
                </apply>
                <apply>
                  <eq/>
                  <ci> RARA </ci>
                  <cn type="integer"> 1 </cn>
                </apply>
                <apply>
                  <eq/>
                  <ci> PML_RARA </ci>
                  <cn type="integer"> 0 </cn>
                </apply>
              </apply>
            </math>
          </qual:functionTerm>
        </qual:listOfFunctionTerms>
      </qual:transition>
    </qual:listOfTransitions>
  </model>
</sbml>
`
