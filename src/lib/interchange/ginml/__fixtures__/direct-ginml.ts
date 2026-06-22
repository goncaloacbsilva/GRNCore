export const DIRECT_GINML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="direct_fixture" nodeorder="RA B C">
    <nodestyle background="#ffffff" foreground="#000000" text="#000000" shape="RECTANGLE" width="120" height="45"/>
    <edgestyle color="#000000" pattern="SIMPLE" line_width="3" properties="positive:#00c800 negative:#c80000 dual:#0000c8"/>
    <node id="RA" name="Retinoic Acid" maxvalue="2" input="true">
      <annotation>
        <linklist>
          <link xlink:href="https://example.org/nodes/ra"/>
        </linklist>
        <comment>RA note.</comment>
      </annotation>
      <nodevisualsetting x="20" y="30" style="Input"/>
    </node>
    <node id="B" name="B" maxvalue="1">
      <parameter val="1"/>
      <annotation>
        <comment>Constitutive B.</comment>
      </annotation>
      <nodevisualsetting x="180" y="30" style=""/>
    </node>
    <node id="C" name="C" maxvalue="1">
      <value val="1">
        <exp str="RA:1 | !B"/>
      </value>
      <annotation>
        <linklist>
          <link xlink:href="https://example.org/nodes/c"/>
        </linklist>
        <comment>Target C.</comment>
      </annotation>
      <nodevisualsetting x="100" y="150" style=""/>
    </node>
    <edge id="RA:C" from="RA" to="C" effects="1:positive 2:positive">
      <annotation>
        <linklist>
          <link xlink:href="https://example.org/edges/ra-c"/>
        </linklist>
        <comment>RA activates C.</comment>
      </annotation>
      <edgevisualsetting points="60,80 80,120" anchor="NE" style=""/>
    </edge>
    <edge id="B:C" from="B" to="C" minvalue="1" sign="negative">
      <edgevisualsetting points="180,80 130,120" anchor="NE" style=""/>
    </edge>
    <annotation>
      <linklist>
        <link xlink:href="https://example.org/models/direct"/>
      </linklist>
      <comment>Direct fixture comment.</comment>
    </annotation>
  </graph>
</gxl>
`
