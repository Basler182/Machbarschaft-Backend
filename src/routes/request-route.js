'use strict';

import Router from 'express';
import RequestController from './../controllers/request-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /request/guest:
 *   post:
 *     summary: Create a new request as guest
 *     description: Creates a new request for the user with the given phone number without being logged in. If this user already has a request in the 'creation' stage, this request is returned and can be worked on until it is ready to be published.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: phone
 *        type: Number
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully created or loaded unpublished request.
 *         schema:
 *           type: request
 *       500:
 *          description: Internal server error
 */
router.post(
  '/guest',
  Validator.phoneValidationRules(),
  Validator.validate,
  RequestController.createLoggedOut
);

/**
 * @swagger
 * /request:
 *   post:
 *     summary: Create a new request
 *     description: Creates a new request for the authenticated user. If this user already has a request in the 'creation' stage, this request is returned and can be worked on until it is ready to be published.
 *     tags:
 *       - request
 *     responses:
 *       200:
 *         description: Successfully created or loaded unpublished request.
 *         schema:
 *           type: request
 *       500:
 *          description: Internal server error
 */
router.post(
  '/',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.createLoggedIn
);

/**
 * @swagger
 * /request/{reqId}:
 *   put:
 *     summary: Update the request
 *     description: Update the request specified by the 'reqId'.
 *     tags:
 *       - request
 *     parameters:
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                          name:
 *                              type: String
 *                              required: false
 *                          addressId:
 *                              type: ObjectId
 *                              required: false
 *                          requestType:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - groceries
 *                                  - medication
 *                                  - other
 *                          urgency:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - now
 *                                  - today
 *                                  - tomorrow
 *                                  - this-week
 *                          prescriptionRequired:
 *                              type: Boolean
 *                              required: false
 *                          carNecessary:
 *                              type: Boolean
 *                              required: false
 *     responses:
 *       200:
 *         description: Successfully updated request.
 *         schema:
 *           type: request
 *       400:
 *          description: Request is already published.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules('jwt'),
  Validator.requestValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.updateLoggedIn
);

/**
 * @swagger
 * /request/guest/{reqId}:
 *   put:
 *     summary: Update the request as guest
 *     description: Update the request specified by the 'reqId' as guest.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: phone
 *        type: Number
 *        required: true
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                          name:
 *                              type: String
 *                              required: false
 *                          addressId:
 *                              type: ObjectId
 *                              required: false
 *                          requestType:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - groceries
 *                                  - medication
 *                                  - other
 *                          urgency:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - now
 *                                  - today
 *                                  - tomorrow
 *                                  - this-week
 *                          prescriptionRequired:
 *                              type: Boolean
 *                              required: false
 *                          carNecessary:
 *                              type: Boolean
 *                              required: false
 *     responses:
 *       200:
 *         description: Successfully updated request.
 *         schema:
 *           type: request
 *       400:
 *          description: Request is already published.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No user with given phone number. OR No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/guest/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.phoneValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  RequestController.updateLoggedOut
);

/**
 * @swagger
 * /request/{reqId}/reopen:
 *   put:
 *     summary: Reopen request
 *     description: Reopen the request with 'reqId' as id. This is only successful as a follow-up action after a feedback for this request, where contact is requested.
 *     tags:
 *       - request
 *     parameters:
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully reopened the request.
 *       400:
 *          description: Request can only be reopened after giving feedback to this process and asking for contact. The request's' status must be "done".
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/:reqId/reopen',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.reopenRequest
);

/**
 * @swagger
 * /request/{reqId}/publish:
 *   put:
 *     summary: Publish request
 *     description: Publish the request with 'reqId' as id. This is only successful if all necessary information has been added to the request.
 *     tags:
 *       - request
 *     parameters:
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully published the request.
 *       400:
 *          description: Request does not contain necessary information. OR Request has been published before.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/:reqId/publish',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.publishLoggedIn
);

/**
 * @swagger
 * /request/guest/{reqId}/publish:
 *   put:
 *     summary: Publish request as guest
 *     description: Publish the request with 'reqId' as a guest. This is only successful if all necessary information has been added to the request.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: phone
 *        type: Number
 *        required: true
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully published the request.
 *       400:
 *          description: Request does not contain necessary information. OR Request has been published before.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No user with given phone number. OR No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/guest/:reqId/publish',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules('machbarschaft_phoneVerified'),
  Validator.validate,
  RequestController.publishLoggedOut
);

/**
 * @swagger
 * /request/open-requests:
 *   get:
 *     summary:  Get open requests
 *     description: Returns all open requests within the specified radius of the user's location.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: latitude
 *        type: Number
 *        required: false
 *      - in: query
 *        name: longitude
 *        type: Number
 *        required: false
 *     responses:
 *       200:
 *         description: successfully returned open requests in area
 *       400:
 *         description: The user's location is not provided. Either set staticPosition in user-preferences or enable gps tracking.
 *       401:
 *         description: not authorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/open-requests',
  Validator.cookieValidationRules('jwt'),
  Validator.positionValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.getOpenRequestsNearby
);

export default router;
