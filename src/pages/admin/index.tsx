import React from "react";
import Head from "next/head";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import AdminBody from "src/components/Admin/AdminBody";

export default function Dashboard() {
  return (
    <AdminBody>
      <Container maxWidth="lg">
        <Head>
          <title>Admin - Dashboard</title>
        </Head>
        <Typography variant={"h5"}>
          <b>Admin Dashboard</b>
        </Typography>
      </Container>
    </AdminBody>
  );
}