module.exports = {
  onCreateUser: {
    subscribe(root, args, ctx) {
      return ctx.prisma.$subscribe.user({ mutation_in: ['CREATED'] }).node();
    },
    resolve: payload => payload,
  },
  onUpdateUser: {
    subscribe(root, args, ctx) {
      return ctx.prisma.$subscribe.user({ mutation_in: ['UPDATED'] }).node();
    },
    resolve: payload => payload,
  },
  onDeleteUser: {
    subscribe(root, args, ctx) {
      return ctx.prisma.$subscribe.user({ mutation_in: ['DELETED'] }).node();
    },
    resolve: payload => payload,
  },
};
