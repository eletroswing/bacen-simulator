# bacen-simulator
BacenSimulator is a docker image to simulate bacen, an official Brazilian payment infrastructure.

# Api References
To read all the api files, or see the flux in images, please, go to [docs.](DOC.md)

# Stack
- [Fastify](https://fastify.dev/)
- [XML Body Parser (fastify middleware)](https://www.npmjs.com/package/fastify-xml-body-parser?activeTab=readme)
- [Sqlite3] (https://www.npmjs.com/package/sqlite3)
- [Commitizen](https://github.com/commitizen/cz-cli)
- [Typescript](https://www.typescriptlang.org/download)
- [Zod for data validation](https://zod.dev/)

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
# How do I contribute?
Please check the contribution docs on [contributing.md](CONTRIBUTING.md).
