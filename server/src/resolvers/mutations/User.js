module.exports = {
  createUser(root, args, ctx) {
    return ctx.prisma.createUser({ ...args.input });
  },
  updateUser(root, args, ctx) {
    return ctx.prisma.updateUser({
      where: { id: args.id },
      data: args.input,
    });
  },
  deleteUser(root, args, ctx) {
    return ctx.prisma.deleteUser({ id: args.id });
  },
};
