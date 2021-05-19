import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import debounce from "lodash.debounce";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Alert from "@material-ui/lab/Alert";
import TextField from "@material-ui/core/TextField";

import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import AdminBody from "src/components/Admin/AdminBody";
import PrimaryButton from "src/components/PrimaryButton";
import Loading from "src/components/Loading";
import { InfoAlert } from "src/components/Admin/FormInputs";

import { getArticleList, deleteArticle } from "./api";
import { useStyles, StyledTableCell, StyledTableRow } from "./styles";

import getConfig from "next/config";

export default function Articles() {
  const classes = useStyles();
  const router = useRouter();
  const PUBLIC_BASE = getConfig().publicRuntimeConfig.PUBLIC_PAGE_BASE_URL;

  // Fetch Article list
  const {
    status: articleListStatus,
    data: { articles: articleListData = [], meta = { limit_value: 60, total_count: 0 } } = {},
    error: articleListError,
    refetch: articleListRefetch,
  } = useQuery("articleList", async () => await getArticleList(location.search));

  // Create an Alert for info feedback
  const [infoAlert, setInfoAlert] = useState({ severity: "info", message: "" });

  const [pageOptions, setPageOptions] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(meta.limit_value);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [deleteArticleDialog, setDeleteArticleDialog] = useState({ isOpen: false, title: "", articleId: "" });

  // Force refetch after search update
  useEffect(() => {
    router.replace({
      pathname: router.pathname,
      query: searchValue ? { query: searchValue, ...pageOptions } : pageOptions,
    });
    setTimeout(() => articleListRefetch(), 500);
  }, [searchValue, pageOptions]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
    setPageOptions({ per_page: rowsPerPage, page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setPageOptions({ per_page: parseInt(event.target.value, 10), page: 1 });
  };

  const debouncedSearchInput = useCallback(
    debounce((value: string) => setSearchValue(value), 2000),
    [],
  );

  const onDelete = async (articleId: string) => {
    deleteArticleDialogClose();
    try {
      const response = await deleteArticle(articleId);
      if (response) setInfoAlert({ severity: "error", message: "Error deleting article !" });
      else {
        setInfoAlert({ severity: "success", message: "Article deleted successfully" });
        setTimeout(() => articleListRefetch(), 500);
      }
    } catch (error) {
      setInfoAlert({ severity: "error", message: `Error deleting article! - ${error}` });
    }
    setTimeout(() => {
      setInfoAlert({ severity: "info", message: "" });
    }, 4500);
  };

  const deleteArticleDialogOpen = (title: string, articleId: string) => {
    setDeleteArticleDialog({ isOpen: true, title: title, articleId: articleId });
  };

  const deleteArticleDialogClose = () => {
    setDeleteArticleDialog({ isOpen: false, title: "", articleId: "" });
  };

  return (
    <AdminBody>
      <Head>
        <title>TrueArtists: Admin/Articles</title>
      </Head>

      <Grid container>
        <Grid item xs={12} sm={6} md={4} lg={4}>
          {infoAlert.message ? (
            <InfoAlert infoAlert={infoAlert} setInfoAlert={setInfoAlert} />
          ) : (
            <Breadcrumbs>
              <Typography variant="h6">
                <Link href="/admin">Dashboard</Link>
              </Typography>
              <Typography variant="h6">Articles</Typography>
            </Breadcrumbs>
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Autocomplete
            freeSolo
            options={
              articleListStatus === "success"
                ? articleListData?.map((option: Admin.Articles) => option.title ?? "")
                : []
            }
            inputValue={searchInputValue}
            onInputChange={(event, newInputValue) => {
              setSearchInputValue(newInputValue);
              debouncedSearchInput(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Articles"
                size="small"
                variant="outlined"
                InputProps={{ ...params.InputProps, type: "search" }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={4}>
          <Grid container item justify="center">
            <PrimaryButton primaryColor onClick={() => router.push(`${router.pathname}/create`)}>
              Add New Article
            </PrimaryButton>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          {articleListStatus === "loading" ? (
            <React.Fragment>
              <Alert severity="info">Loading... </Alert>
              <Loading />
            </React.Fragment>
          ) : articleListStatus === "error" ? (
            <Alert severity="error">{`Retrieving Articles - ${articleListError}`}</Alert>
          ) : articleListData.length > 0 ? (
            <React.Fragment>
              <TableContainer className={classes.tableContainer}>
                <Table size="small" stickyHeader>
                  <colgroup>
                    <col width="auto" />
                    <col width="auto" />
                    <col width="10%" />
                    <col width="5%" />
                    <col width="5%" />
                  </colgroup>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Title</StyledTableCell>
                      <StyledTableCell>Author</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell className={classes.statusHeader} colSpan={2}>
                        Actions
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {articleListData.map((article: Admin.Articles, index: number) => (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          <Link href={`${PUBLIC_BASE}/blog/${article.slug}`}>
                            <a target="_blank" className={classes.listLink}>
                              {article.title}
                            </a>
                          </Link>
                        </StyledTableCell>
                        <StyledTableCell>{article.user.full_name}</StyledTableCell>
                        <StyledTableCell>{article.status}</StyledTableCell>
                        <StyledTableCell>
                          <Link href={`${router.pathname}/edit/${article.id}`}>
                            <a className={classes.listLink}>Edit</a>
                          </Link>
                        </StyledTableCell>
                        <StyledTableCell
                          className={classes.deleteCell}
                          onClick={() => deleteArticleDialogOpen(article.title, article.id.toString())}
                        >
                          Delete
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                rowsPerPageOptions={[5, 10, 20, 40, 60, { value: meta.total_count, label: "All" }]}
                rowsPerPage={rowsPerPage}
                count={meta.total_count}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                className={classes.paginationWrapper}
              />
            </React.Fragment>
          ) : (
            <Alert severity="info">No articles records found...</Alert>
          )}
        </Grid>
      </Grid>

      {deleteArticleDialog.isOpen ? (
        <ConfirmResetPassword
          title={deleteArticleDialog.title}
          articleId={deleteArticleDialog.articleId}
          close={deleteArticleDialogClose}
          isOpen={deleteArticleDialog.isOpen}
          handleDelete={onDelete}
        />
      ) : (
        <React.Fragment />
      )}
    </AdminBody>
  );
}

function ConfirmResetPassword({
  title,
  articleId,
  close,
  isOpen,
  handleDelete,
}: {
  title: string;
  articleId: string;
  close: () => void;
  isOpen: boolean;
  handleDelete: (T: string) => void;
}) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <IconButton className={classes.closeButton} onClick={close}>
        <CloseIcon />
      </IconButton>
      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this article?
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            <b>{title}</b>
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton variant="outlined" size="small" primaryColor onClick={close}>
            Cancel
          </PrimaryButton>
          <PrimaryButton size="small" primaryColor onClick={() => handleDelete(articleId)}>
            Delete
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}