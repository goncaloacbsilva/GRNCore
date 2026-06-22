export const ACTIVE_INTERACTIONS_GINML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="active_fixture" nodeorder="A B C">
    <node id="A" name="A" maxvalue="1">
      <parameter val="1"/>
      <nodevisualsetting x="10" y="10" style=""/>
    </node>
    <node id="B" name="B" maxvalue="1">
      <parameter val="1"/>
      <nodevisualsetting x="110" y="10" style=""/>
    </node>
    <node id="C" name="C" maxvalue="1">
      <parameter val="1" idActiveInteractions="B:C:1"/>
      <parameter val="1" idActiveInteractions="A:C:1"/>
      <parameter val="1" idActiveInteractions="A:C:1 B:C:1"/>
      <nodevisualsetting x="75" y="108" style=""/>
    </node>
    <edge id="A:C" from="A" to="C" minvalue="1" sign="positive">
      <edgevisualsetting anchor="NE" style=""/>
    </edge>
    <edge id="B:C" from="B" to="C" minvalue="1" sign="positive">
      <edgevisualsetting anchor="NE" style=""/>
    </edge>
  </graph>
</gxl>
`
