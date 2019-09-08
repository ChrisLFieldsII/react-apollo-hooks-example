module.exports = {
  getUser(root, args, ctx) {
    return ctx.prisma.user({ id: args.id });
  },
  listUsers(root, args, ctx) {
    return ctx.prisma.users();
  },
};
