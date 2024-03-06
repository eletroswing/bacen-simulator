# bacen-simulator
BacenSimulator is a docker image to simulate bacen, a official brazilian payment infrastructure

# Idea
It aims to be a complete docker simulation system based on the following documents:
- [Message Protocol](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Catalogos/Catalogo_de_Servicos_do_SFN_Volume_III_Versao_507.pdf)
- [More about pix message protocol](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Catalogos/Catalogo_de_Servicos_do_SFN_Volume_VI_Versao_507.pdf)

# Stack
To be defined(should be something easy)

# The commnuication itself
All messages exchanged in the system follow the standards established in the documentation, therefore, XML (*extensible markup language*) will be used in the body of the messages.

An example message is shown in the [*Catalogo de servicos do SFN volume 3*](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Catalogos/Catalogo_de_Servicos_do_SFN_Volume_III_Versao_507.pdf), page 11:
```xml
<?xml version="1.0"?>
<DOC xmlns=”http://www.bcb.gov.br/XXX/YYYYYYY.xsd”>
 <BCMSG>
 . . . control
 </BCMSG>
 <SISMSG>
 . . . system
 </SISMSG>
 <USERMSG>
 . . . user
 </USERMSG>
</DOC>
```
Another example of a message is present in the same manual, on page 14:

```xml
<?xml version="1.0"?>
<DOC xmlns=”http://www.bcb.gov.br/GEN/GEN0001.xsd”>
 <BCMSG>
 <IdentdEmissor>########</IdentdEmissor>
 <IdentdDestinatario>########</IdentdDestinatario>
 <DomSist>SPB01</DomSist>
 <NUOp>###########################################</NUOp>
 </BCMSG>
 <SISMSG>
 <GEN0001>
 <CodMsg>GEN0001</CodMsg>
 <ISPBEmissor>########</ISPBEmissor>
 <ISPBDestinatario>########</ISPBDestinatario>
 <MsgECO>text with max of 50 characters</MsgECO>
 </GEN0001>
 </SISMSG>
 <USERMSG>
 . . . free area
 </USERMSG>
</DOC>
```
# Commits
Let's follow the following commit format, to adopt a standard message:
- action(location): description

- Ex: 
  - feat(docs): improving description
  - fix(bug01): improving description
  - chore(docs): improving description
