use finanservs;

CREATE TABLE `sectors` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `short_name` varchar(2) NOT NULL,
  PRIMARY KEY (`id`)
);


insert into sectors values (1, 'Privado', 'P');
insert into sectors values (2, 'Publico', 'Pb');
insert into sectors values (3, 'Jubilado', 'J');


CREATE TABLE `profesions` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
);

insert into profesions values (1, 'Empresa Privada');
insert into profesions values (2, 'Medicos Enfermeras');
insert into profesions values (3, 'Educador');
insert into profesions values (4, 'Adminis trativo');
insert into profesions values (5, 'ACP');
insert into profesions values (6, 'Seguridad Publica');
insert into profesions values (7, 'Jubilado');


CREATE TABLE `sector_profesion` (
  `id` int NOT NULL,
  `id_sector` int NOT NULL,
  `id_profesion` int NOT NULL,
  `is_active` boolean,
  PRIMARY KEY (`id`)
) ;

insert into sector_profesion  values (4,1,1,true);
insert into sector_profesion  values (2,1,2,true);
insert into sector_profesion  values (3,1,3,true);
insert into sector_profesion  values (5,2,2,true);
insert into sector_profesion  values (6,2,3,true);
insert into sector_profesion  values (7,2,4,true);
insert into sector_profesion  values (8,2,5,true);
insert into sector_profesion  values (9,2,6,true);
insert into sector_profesion  values (1,3,7,true);


CREATE TABLE `institutions` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ;


CREATE TABLE `planillas_j` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


CREATE TABLE `ranges_pol` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_active` boolean,
  PRIMARY KEY (`id`)
) ;


insert into ranges_pol (id, name, is_active) values (1,'RANGOS',true);
insert into ranges_pol (id, name, is_active) values (2,'CABO 1RO.',true);
insert into ranges_pol (id, name, is_active) values (3,'CABO 2DO.',true);
insert into ranges_pol (id, name, is_active) values (4,'CADETE DE POLICIA',true);
insert into ranges_pol (id, name, is_active) values (5,'CAPELLAN',true);
insert into ranges_pol (id, name, is_active) values (6,'CAPITAN',true);
insert into ranges_pol (id, name, is_active) values (7,'COMISIONADO DE POLICIA',true);
insert into ranges_pol (id, name, is_active) values (8,'DIRECTOR GENERAL',true);
insert into ranges_pol (id, name, is_active) values (9,'GUARDIA',true);
insert into ranges_pol (id, name, is_active) values (10,'MAYOR',true);
insert into ranges_pol (id, name, is_active) values (11,'SARGENTO 1RO.',true);
insert into ranges_pol (id, name, is_active) values (12,'SARGENTO 2DO.',true);
insert into ranges_pol (id, name, is_active) values (13,'SUB-COMISIONADO DE POLICIA',true);
insert into ranges_pol (id, name, is_active) values (14,'SUB-DIRECTOR GENERAL',true);
insert into ranges_pol (id, name, is_active) values (15,'SUB-TENIENTE',true);
insert into ranges_pol (id, name, is_active) values (16,'TENIENTE',true);



CREATE TABLE `profesions_lw` (
  `id` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ;


CREATE TABLE `profesions_acp` (
  `id` int NOT NULL,
  `titulo` varchar(60) NOT NULL,
  `grupo` varchar(45) DEFAULT NULL,
  `segmento` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
);


CREATE TABLE `civil_status` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ;

insert into civil_status values (1, 'Casado');
insert into civil_status values (2, 'Soltero');
insert into civil_status values (3, 'Unido');
insert into civil_status values (4, 'Divorciado');
insert into civil_status values (5, 'Viudo');


CREATE TABLE `purposes` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `is_active` boolean,
  PRIMARY KEY (`id`)
) ;

insert into purposes value (0, 'Compra de Auto', true);
insert into purposes value (1, 'Boda', true);
insert into purposes value (2, 'Remodelación', true);
insert into purposes value (3, 'Colegio', true);
insert into purposes value (4, 'Viaje', true);
insert into purposes value (5, 'Quince años', true);


CREATE TABLE `laboral_status` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `is_active` boolean,
  PRIMARY KEY (`id`)
) ;

insert into laboral_status value (0, 'Temporal', true);
insert into laboral_status value (1, 'Permanente', true);
insert into laboral_status value (2, 'Serv. Profesional', true);


CREATE TABLE `payments` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
);


insert into payments value (1, '0 a 30 Días');
insert into payments value (2, '31 a 60 Días');
insert into payments value (3, '61 a 90 Días');
insert into payments value (4, 'Arreglo de Pago');
insert into payments value (5, 'Demanda Judicial/ Cuenta Contra Reserva');


CREATE TABLE `housings` (
  `id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `is_active` boolean,
  PRIMARY KEY (`id`)
) ;

insert into housings value (1, 'Casa Propia', true);
insert into housings value (2, 'Padres o Familiares', true);
insert into housings value (3, 'Casa Hipotecada', true);
insert into housings value (4, 'Casa Alquilada', true);


CREATE TABLE `entity_params` (
  `id`   int NOT NULL AUTO_INCREMENT,
  `id_entity_f`   int NOT NULL,
  `id_sector_profesion`   int NOT NULL,
  `descto_chip` float DEFAULT NULL,
  `descto_ship` float DEFAULT NULL,
  `deuda_chip` float DEFAULT NULL,
  `deuda_ship` float DEFAULT NULL,
  `plazo_max`   int DEFAULT NULL,
  `tasa` float DEFAULT NULL,
  `comision` float DEFAULT NULL,
  `mount_min` float DEFAULT NULL,
  `mount_max` float DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

insert into entity_params (id_entity_f,id_sector_profesion,descto_chip, descto_ship,deuda_chip,deuda_ship,plazo_max,tasa,comision,mount_min,mount_max,is_active)
select 1,	4	,	20,	20,	50,	45,	120,	11,	7,	3000,	25000,1 union all
select 1,	2	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 1,	3	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 1,	5	,	35,	35,	55,	55,	360,	7.25,	9.8,	3000,	50000,1 union all
select 1,	6	,	35,	35,	55,	55,	360,	7.25,	9.8,	3000,	50000,1 union all
select 1,	7	,	35,	35,	55,	45,	180,	11,	6.25,	3000,	35000,1 union all
select 1,	8	,	50,	75,	50,	45,	360,	9,	5.25,	0,	75000,1 union all
select 1,	9	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1 union all
select 1,	1	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1;

insert into entity_params (id_entity_f,id_sector_profesion,descto_chip, descto_ship,deuda_chip,deuda_ship,plazo_max,tasa,comision,mount_min,mount_max,is_active)
select 2,	4	,	20,	20,	50,	45,	120,	11,	7,	3000,	25000,1 union all
select 2,	2	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 2,	3	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 2,	5	,	25,	25,	40,	40,	360,	7.25,	9.8,	3000,	50000,1 union all
select 2,	6	,	35,	35,	55,	55,	360,	7.25,	9.8,	3000,	50000,1 union all
select 2,	7	,	35,	35,	55,	45,	180,	11,	6.25,	3000,	35000,1 union all
select 2,	8	,	50,	75,	50,	45,	360,	9,	5.25,	0,	75000,1 union all
select 2,	9	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1 union all
select 2,	1	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1;

insert into entity_params (id_entity_f,id_sector_profesion,descto_chip, descto_ship,deuda_chip,deuda_ship,plazo_max,tasa,comision,mount_min,mount_max,is_active)
select 3,	4	,	20,	20,	50,	45,	120,	11,	7,	3000,	25000,1 union all
select 3,	2	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 3,	3	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 3,	5	,	27,	27,	43,	43,	360,	7.25,	9.8,	3000,	50000,1 union all
select 3,	6	,	35,	35,	55,	55,	360,	7.25,	9.8,	3000,	50000,1 union all
select 3,	7	,	35,	35,	55,	45,	180,	11,	6.25,	3000,	35000,1 union all
select 3,	8	,	50,	75,	50,	45,	360,	9,	5.25,	0,	75000,1 union all
select 3,	9	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1 union all
select 3,	1	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1;

insert into entity_params (id_entity_f,id_sector_profesion,descto_chip, descto_ship,deuda_chip,deuda_ship,plazo_max,tasa,comision,mount_min,mount_max,is_active)
select 4,	4	,	20,	20,	50,	45,	120,	11,	7,	3000,	25000,1 union all
select 4,	2	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 4,	3	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 4,	5	,	23,	23,	37,	37,	360,	7.25,	9.8,	3000,	50000,1 union all
select 4,	6	,	35,	35,	55,	55,	360,	7.25,	9.8,	3000,	50000,1 union all
select 4,	7	,	35,	35,	55,	45,	180,	11,	6.25,	3000,	35000,1 union all
select 4,	8	,	50,	75,	50,	45,	360,	9,	5.25,	0,	75000,1 union all
select 4,	9	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1 union all
select 4,	1	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1;

insert into entity_params (id_entity_f,id_sector_profesion,descto_chip, descto_ship,deuda_chip,deuda_ship,plazo_max,tasa,comision,mount_min,mount_max,is_active)
select 5,	4	,	20,	20,	50,	45,	120,	11,	7,	3000,	25000,1 union all
select 5,	2	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 5,	3	,	20,	20,	50,	45,	144,	10,	6,	3000,	30000,1 union all
select 5,	5	,	15,	15,	30,	30,	360,	7.25,	9.8,	3000,	50000,1 union all
select 5,	6	,	35,	35,	55,	55,	360,	7.25,	9.8,	3000,	50000,1 union all
select 5,	7	,	35,	35,	55,	45,	180,	11,	6.25,	3000,	35000,1 union all
select 5,	8	,	50,	75,	50,	45,	360,	9,	5.25,	0,	75000,1 union all
select 5,	9	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1 union all
select 5,	1	,	35,	35,	100,100,180,	11,	6.25,	3000,	35000,1;


CREATE TABLE `prospects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_personal` varchar(20) NOT NULL,
  `idUser` varchar(30) NOT NULL,
  `name` varchar(60) NOT NULL,
  `fname` varchar(60) NOT NULL,
  `fname_2` varchar(60) DEFAULT NULL,
  `lname` varchar(60) NOT NULL,
  `lname_2` varchar(60) DEFAULT NULL,
  `entity_f` varchar(15) NOT NULL,
  `estado` int NOT NULL,
  `email` varchar(30) NOT NULL,
  `cellphone` varchar(15) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `idUrl` varchar(160) DEFAULT NULL,
  `socialSecurityProofUrl` varchar(160) DEFAULT NULL,
  `publicGoodProofUrl` varchar(160) DEFAULT NULL,
  `workLetterUrl` varchar(160) DEFAULT NULL,
  `payStubUrl` varchar(160) DEFAULT NULL,
  `origin_idUser` varchar(10) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `contractType` int DEFAULT NULL,
  `jobSector` int DEFAULT NULL,
  `occupation` int DEFAULT NULL,
  `paymentFrecuency` int DEFAULT NULL,
  `profession` int DEFAULT NULL,
  `residenceType` int DEFAULT NULL,
  `civil_status` int DEFAULT NULL,
  `province` int DEFAULT NULL,
  `district` int DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `loanPP` decimal(10,2) DEFAULT NULL,
  `loanAuto` decimal(10,2) DEFAULT NULL,
  `loanTC` decimal(10,2) DEFAULT NULL,
  `loanHip` decimal(10,2) DEFAULT NULL,
  `cashOnHand` decimal(10,2) DEFAULT NULL,
  `plazo` int NOT NULL,
  `fcreate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fupdate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `quotation` text NOT NULL,
  `application` text NOT NULL,
  `sign` blob DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_personal` (`id_personal`),
  KEY `entity_f` (`entity_f`)
) ;



CREATE TABLE `estados_tramite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(10) NOT NULL,
	`is_active` boolean,
  PRIMARY KEY (`id`)
) ;

insert into estados_tramite (name, is_active) value ('Nuevo', true);
insert into estados_tramite (name, is_active) value ('Proceso', true);
insert into estados_tramite (name, is_active) value ('Aprobado', true);
insert into estados_tramite (name, is_active) value ('Rechazado', true);
    

CREATE TABLE `entities_f` (
`id` int NOT NULL AUTO_INCREMENT,
`id_ruta` varchar(10) NOT NULL,
`name` varchar(60) NOT NULL,
`contact` varchar(60) NOT NULL,
`phone_number` varchar(10) NOT NULL,
`cellphone` varchar(10) NOT NULL,
`is_active` tinyint(1) DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `id_ruta_UNIQUE` (`id_ruta`)
) ;


insert into entities_f (id_ruta, name, contact, phone_number, cellphone, is_active) value ('100', 'Tarifa y Comisión Base', 'Uso Interno', '507-0000', '6000-0000', true);
insert into entities_f (id_ruta, name, contact, phone_number, cellphone, is_active) value ('500', 'Global Bank', 'Oficial de Cuenta', '507-0000', '6000-0000', true);
insert into entities_f (id_ruta, name, contact, phone_number, cellphone, is_active) value ('200', 'BAC', 'Oficial de Cuenta', '507-0000', '6000-0000', true);
insert into entities_f (id_ruta, name, contact, phone_number, cellphone, is_active) value ('300', 'Multibank', 'Oficial de Cuenta', '507-0000', '6000-0000', true);
insert into entities_f (id_ruta, name, contact, phone_number, cellphone, is_active) value ('400', 'St. George', 'Oficial de Cuenta', '507-0000', '6000-0000', true);


CREATE TABLE `type_documents` (
  `id` int NOT NULL,
  `name` varchar(30) NOT NULL,
  `id_name` varchar(15) NOT NULL,
	`is_active` boolean,
  PRIMARY KEY (`id`)
) ;


insert into type_documents (id, name, id_name, is_active) value (1, 'Cédula', 'CEDULA', true);
insert into type_documents (id, name, id_name, is_active) value (2, 'Comprobante de pago', 'COMP-PAGO', true);
insert into type_documents (id, name, id_name, is_active) value (3, 'Ficha del seguro social', 'FICHA-SS', true);
insert into type_documents (id, name, id_name, is_active) value (4, 'Recibo de servicio', 'SERV-PUBLICO', true);
insert into type_documents (id, name, id_name, is_active) value (5, 'Carta de Trabajo', 'CARTA-TRABAJO', true);


CREATE TABLE `terms_loan` (
  `id` int NOT NULL,
  `name` varchar(30) NOT NULL,
	`is_active` boolean,
  PRIMARY KEY (`id`)
) ;

insert into terms_loan (id, name, is_active) value (60, '60', true);
insert into terms_loan (id, name, is_active) value (120, '120', true);
insert into terms_loan (id, name, is_active) value (180, '180', true);
insert into terms_loan (id, name, is_active) value (240, '240', true);
insert into terms_loan (id, name, is_active) value (360, '360', true);


CREATE TABLE `provinces` (
  `id` int NOT NULL,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ;


CREATE TABLE `districts` (
  `id` int NOT NULL,
  `idProv` int NOT NULL,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ;


CREATE TABLE `counties` (
  `id` int NOT NULL,
  `idProv` int NOT NULL,
  `idDist` int NOT NULL,
  `name` varchar(35) NOT NULL,
  PRIMARY KEY (`id`)
) ;



CREATE TABLE `nationality` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
	`is_active` boolean,
  PRIMARY KEY (`id`)
) ;


insert into nationality (name, is_active) value ('Panameña', true);
insert into nationality (name, is_active) value ('Venezolano', true);
insert into nationality (name, is_active) value ('Colombiano', true);
insert into nationality (name, is_active) value ('Monagrillero', true);
    

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(10) NOT NULL,
  `description` varchar(50) NOT NULL,
  `dateCreated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dateUpdated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `role_UNIQUE` (`role`),
  PRIMARY KEY (`id`)
);

insert into roles (role, description) value ('Admin','Administrador del Sistema');

    
CREATE TABLE `users` (
  `id`   int NOT NULL AUTO_INCREMENT,
  `id_role`   int NOT NULL,
  `email` varchar(50) NOT NULL,
  `hash` varchar(100) NOT NULL,
  `entity_f`   int DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `cellPhone` varchar(15) NOT NULL,
  `is_new` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `dateCreated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dateUpdated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `id_role` (`id_role`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`)
) ;


#123456
insert into users (id_role,email,hash,entity_f,name,address,phoneNumber,cellPhone,is_new,is_active) 
value (1,'guasimo01@gmail.com','$2a$10$SKNf4sjGXFmG1/q6Gt3vSuscXeNA0ujCKL0XtF8V7mD6xiqC.99h6',0,'Leonel Rodriguez','New York, 5h Av.','390-0000','6645-0000',false,true);


