import {
  requestTypes,
  urgencyCategories,
  statusStages,
} from './models/request-model';
import { colors } from './models/example-model';

const {
  check,
  body,
  validationResult,
  header,
  oneOf,
  param,
  query,
} = require('express-validator');

const userValidationRules = () => {
  return [
    // username must be an email
    body(
      'email',
      'Die E-Mail-Adresse muss im E-Mail-Format angegeben werden.'
    ).isEmail(),
    // password must be at least 5 chars long
    body(
      'password',
      'Das Passwort muss mindestens 5 Zeichen lang sein.'
    ).isLength({ min: 5 }),
  ];
};

const requireUserIdOrPhoneNumber = () => {
  return oneOf(phoneValidationRules().concat(idValidationRules('userId')));
};

const idValidationRules = (fieldName) => {
  return [
    check(
      fieldName,
      "Die '" + fieldName + "' muss aus 24 Kleinbuchstaben und Zahlen bestehen."
    ).isMongoId(),
  ];
};

const phoneValidationRules = () => {
  return [
    check(
      'phone',
      'Die Telefonnummer muss eine gültige deutsche Mobiltelefonnummer sein.'
    ).isMobilePhone('de-DE'),
  ];
};

const processFeedbackValidationRules = () => {
  return [
    param(
      'type',
      'Der Typ muss einen der folgenden Werte haben: request, response'
    ).isIn(['request', 'response']),
    body(
      'needContact',
      'Gib an ob eine Rückmeldung vom Machbarschaft-Team erwünscht ist (true, false)'
    ).isBoolean(),
    body('comment', 'Die Nachricht des Feedbacks als Zeichenkette.').isString(),
  ];
};

const requestValidationRules = () => {
  return [
    body(
      'requestType',
      'Der Auftragstyp darf nur folgende Werte haben: ' +
        requestTypes.toString()
    )
      .optional()
      .isIn(requestTypes),
    body(
      'urgency',
      'Die Dringlichkeit kann nur folgende Werte haben: ' +
        urgencyCategories.toString()
    )
      .optional()
      .isIn(urgencyCategories),
    body('carNecessary', "Darf nur 'true' oder 'false' sein.")
      .optional()
      .isBoolean(),
    body('status', 'Der Status darf nicht gesetzt werden.').optional().isIn([]),
    body('prescriptionRequired', "Darf nur 'true' oder 'false' sein.")
      .optional()
      .isBoolean(),
    body(
      'addressId',
      'Die ID der Adresse ist eine 24-stellige Zeichenkette aus Kleinbuchstaben und Zahlen.'
    )
      .optional()
      .isMongoId(),
  ].concat(nameValidationRules('name', true));
};

const addressValidationRules = () => {
  return [
    body(
      'houseNumber',
      'Die Hausnummer muss angegeben werden und darf maximal 10 Ziffern lang sein. Bitte lasse Adresszusätze ' +
        'weg (z.B. nicht Hausnummer 3a sondern nur 3)'
    )
      .isNumeric()
      .isLength({ max: 10 }),
    body(
      'zipCode',
      'Es muss eine in Deutschland gültige Postleitzahl angegeben werden.'
    ).isPostalCode('DE'),
  ]
    .concat(nameValidationRules('street'))
    .concat(nameValidationRules('city'))
    .concat(nameValidationRules('country'));
};

const nameValidationRules = (fieldName, optional = false) => {
  if (optional === true) {
    return [
      check(
        fieldName,
        "Das Feld '" +
          fieldName +
          "' darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen."
      )
        .optional()
        .matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
    ];
  }
  return [
    check(
      fieldName,
      "Das Feld '" +
        fieldName +
        "' muss angegeben werden und darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen."
    ).matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
  ];
};

const cookieValidationRules = (cookieName) => {
  return [header('cookie').contains(cookieName)];
};

const exampleValidationRules = () => {
  return [
    body('name', 'The name must only contain letters.').isAlpha(),
    body(
      'color',
      'The color attribute is required, and consists of letters only.'
    )
      .exists()
      .isAlpha()
      .custom((value) => {
        const result = colors.find((element) => element === value);
        if (!result) {
          return Promise.reject('No valid color.');
        }
        return Promise.resolve();
      }),
  ];
};

const preferencesValidationRules = () => {
  return [
    body('radius', 'Der Radius muss eine positive Zahl sein')
      .optional()
      .isInt({ min: 1 }),
    body(
      'notifyNearbyRequests',
      'Gib an, ob du über neue Aufträge in deiner Nähe informiert werden willst (true, false)'
    )
      .optional()
      .isBoolean(),
    body(
      'useGps',
      'Gib an, ob du GPS zur Bestimmung deines Standorts verwenden willst (true, false)'
    )
      .optional()
      .isBoolean(),
    body(
      'houseNumber',
      'Die Hausnummer muss angegeben werden und darf maximal 10 Ziffern lang sein. Bitte lasse Adresszusätze ' +
        'weg (z.B. nicht Hausnummer 3a sondern nur 3)'
    )
      .optional()
      .isNumeric()
      .isLength({ max: 10 }),
    body(
      'zipCode',
      'Es muss eine in Deutschland gültige Postleitzahl angegeben werden.'
    )
      .optional()
      .isPostalCode('DE'),
  ]
    .concat(nameValidationRules('street', true))
    .concat(nameValidationRules('city', true))
    .concat(nameValidationRules('country', true));
};

const positionValidationRules = () => {
  return [
    query('latitude', 'Der Wert für latitude muss eine Dezimalzahl sein.')
      .optional()
      .isDecimal(),
    query('longitude', 'Der Wert für longitude muss eine Dezimalzahl sein.')
      .optional()
      .isDecimal(),
  ];
};

const contactFormValidationRules = () => {
  return [
    // email must be an email
    body(
        'email',
        'Die E-Mail-Adresse muss im E-Mail-Format angegeben werden.'
    ).isEmail(),
    // text must be at max 1000 chars long
    body(
        'text',
    ).isLength({ max: 1000 }).withMessage('Der Text darf nicht länger als 1000 Zeichen sein.').isLength({ min: 1 }).withMessage("Du musst einen Text übergeben."),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors
    .array({ onlyFirstError: true })
    .map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  addressValidationRules,
  phoneValidationRules,
  idValidationRules,
  nameValidationRules,
  processFeedbackValidationRules,
  requestValidationRules,
  userValidationRules,
  requireUserIdOrPhoneNumber,
  validate,
  cookieValidationRules,
  preferencesValidationRules,
  positionValidationRules,
  exampleValidationRules,
  contactFormValidationRules,
};
