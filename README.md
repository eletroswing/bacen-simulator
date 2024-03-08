# bacen-simulator
BacenSimulator is a docker image to simulate bacen, an official Brazilian payment infrastructure.

# Idea
It aims to be a complete docker simulation system based on the following documents:
- [Message Protocol Vol. III](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Catalogos/Catalogo_de_Servicos_do_SFN_Volume_III_Versao_507.pdf)
- [Message Protocol Vol. VI (Pix Mentioned)](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Catalogos/Catalogo_de_Servicos_do_SFN_Volume_VI_Versao_507.pdf)
- [PIX Initiation Patterns Handbook](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf#page32)
- [An introductory article to pix](https://medium.com/cwi-software/uma-breve-introdução-ao-pix-1a6c9413f8e4)
- [Official DICT API](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT-2.0.1.html)

# Stack
To be defined (should be something easy).

# The communication itself
All messages exchanged in the system follow the standards established in the documentation, therefore, XML (*extensible markup language*) will be used in the body of the messages.

An example message is shown in the [*Catálogo de serviços do SFN volume 3*](https://www.bcb.gov.br/content/estabilidadefinanceira/cedsfn/Catalogos/Catalogo_de_Servicos_do_SFN_Volume_III_Versao_507.pdf), page 11:
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
# How do I commit and PR?
Let's follow the following committing format, to adopt a standard pattern:
- "action(scope): description"

### Examples: 
  - "feat(routes.js): added /getUUID route"
  - "fix(bug01): fixed homepage bug when clicking at hero"
  - "chore(package.json): added a new typescript type package dependency"

Useful references: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
