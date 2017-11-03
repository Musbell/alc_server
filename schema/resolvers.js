const pubsub = require('../pubsub');


function buildFilters({ OR = [], firstNameContains, lastNameContains }) {
  const filter = (firstNameContains || lastNameContains) ? {} : null;
  if (firstNameContains) {
    filter.firstName = { $regex: `.*${firstNameContains}.*` };
  }
  if (lastNameContains) {
    filter.lastName = { $regex: `.*${lastNameContains}.*` };
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
}


const resolvers = {
  Query: {
    allStudents: async (root, { filter, first, skip }, { models }) => { // 1
      const query = filter ? { $or: buildFilters(filter) } : {};
      const cursor = models.Student.findAll(query);
      if (first) {
        cursor.limit(first);
      }
      if (skip) {
        cursor.skip(skip);
      }
      return cursor;
    },
    Student: async (root, { id }, { models }) => await models.Student.findOne({
      where: { id },
    }),
  },
  Mutation: {
    createStudent: async (root, args, { models }) => {
      const newStudent = await models.Student.create(args); // 3

      pubsub.publish('Student', { student: { mutation: 'CREATED', node: newStudent } });

      return newStudent;
    },
    updateStudent: async (root, {
      id,
      lastName,
      firstName,
      otherName,
      gender,
      dateOfBirth,
      nationality,
      sessionOfAdmission,
      dateOfAdmission,
      stateOfOrigin,
      religion,
      address,
      city,
      state,
      email,
      phone,
      newLastName,
      newFirstName,
      newOtherName,
      newGender,
      newDateOfBirth,
      newNationality,
      newSessionOfAdmission,
      newDateOfAdmission,
      newStateOfOrigin,
      newReligion,
      newAddress,
      newCity,
      newState,
      newEmail,
      newPhone,
    }, { models }) => {
      const updatedStudent = await models.Student.update({
        id,
        lastName: newLastName,
        firstName: newFirstName,
        otherName: newOtherName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
        nationality: newNationality,
        sessionOfAdmission: newSessionOfAdmission,
        dateOfAdmission: newDateOfAdmission,
        stateOfOrigin: newStateOfOrigin,
        religion: newReligion,
        address: newAddress,
        city: newCity,
        state: newState,
        email: newEmail,
        phone: newPhone,
      }, {
        where: {
          id,
        },
      }); // 3

      pubsub.publish('Student', { student: { mutation: 'UPDATED', node: updatedStudent } });

      return updatedStudent;
    },
    deleteStudent: async (root, args, { models }) => {
      const deletedStudent = await models.Student.destroy({
        where: args,
      });

      pubsub.publish('Student', { student: { mutation: 'DELETED', node: deletedStudent } });

      return deletedStudent;
    },
  },
  Subscription: {
    Student: {
      subscribe: () => pubsub.asyncIterator('Student'),
    },
  },
};


module.exports = resolvers;
