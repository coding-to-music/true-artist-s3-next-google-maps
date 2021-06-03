import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";

import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import getConfig from "next/config";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardActions from "@material-ui/core/CardActions";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import AdminBody from "src/components/Admin/AdminBody";
import handleApiErrors from "src/components/Admin/handleApiErrors";
import PrimaryButton from "src/components/PrimaryButton";
import { InfoAlert, TextInput } from "src/components/Admin/FormInputs";

import { createConvention } from "./api";
import { countryList } from "src/constants";
import { useStyles } from "./styles";

export default function EditConventions() {
  const classes = useStyles();
  const router = useRouter();
  const PUBLIC_BASE = getConfig().publicRuntimeConfig.PUBLIC_PAGE_BASE_URL;

  // Create a reference to the hidden file input element
  const hiddenFileInput = React.useRef(null);
  const [preview, setPreview] = useState<any>("");
  const [image, setImage] = useState<File | string>("");

  // Create an Alert for info feedback
  const [infoAlert, setInfoAlert] = useState({ severity: "info", message: "" });

  const getFormDefaultValues = () => ({
    name: "",
    description: "",
    start_date: moment(Date()).add(1, "day").toLocaleString(),
    end_date: moment(Date()).add(2, "days").toLocaleString(),
    country: "",
    state: "",
    city: "",
    address: "",
    link_to_official_site: "",
    facebook_link: "",
  });

  const {
    register,
    handleSubmit,
    errors,
    control,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: getFormDefaultValues(),
    shouldUnregister: false,
  });

  const onSubmit = async (formValues: { [T: string]: any }) => {
    const formData = new FormData();

    Object.entries(formValues).map(([key, value]) => formData.append(key, value));

    if (image)
      if (image === "remove") formData.append("image", "");
      else formData.append("image", image);

    try {
      const response = await createConvention(formData);
      if (!response) setInfoAlert({ severity: "error", message: "Error creating convention!" });
      else {
        setInfoAlert({ severity: "success", message: "Convention created successfully" });
        setTimeout(() => {
          router.push(`${PUBLIC_BASE}/conventions/${response.slug}`);
        }, 2500);
        return;
      }
    } catch (error) {
      setInfoAlert({ severity: "error", message: `Error creating convention! - ${handleApiErrors(error)}` });
    }
    setTimeout(() => {
      setInfoAlert({ severity: "info", message: "" });
    }, 4500);
  };

  const handleImageChangeClick = () => {
    // @ts-ignore
    hiddenFileInput?.current?.click();
  };

  const handleImageRemoveClick = () => {
    setImage("remove");
    setPreview(" ");
  };

  // image change
  const handleImageChange = (fileUploaded: File) => {
    setImage(fileUploaded);
    const reader = new FileReader();
    reader.readAsDataURL(fileUploaded);
    reader.onloadend = () => setPreview(reader.result);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <AdminBody>
      <Head>
        <title>TrueArtists: Admin/Conventions/Create</title>
      </Head>

      <Grid container>
        <Grid item xs={12}>
          <Breadcrumbs>
            <Typography variant="h6">
              <Link href="/admin">Dashboard</Link>
            </Typography>
            <Typography variant="h6">
              <Link href="/admin/conventions">Conventions</Link>
            </Typography>
            <Typography variant="h6">Create new</Typography>
          </Breadcrumbs>
        </Grid>

        <Grid item xs={12} className={classes.buttonWrapper}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {infoAlert.message ? <InfoAlert infoAlert={infoAlert} setInfoAlert={setInfoAlert} /> : null}
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={4} lg={3}>
                            <FormControl fullWidth error={errors.start_date ? true : false} required={true}>
                              <FormHelperText>
                                <b>Start Date *</b>
                              </FormHelperText>
                              <Controller
                                name={"start_date"}
                                control={control}
                                rules={{ required: true }}
                                render={(props: any) => (
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                      disableToolbar
                                      format="dd MMM yyyy"
                                      value={props?.value ? moment(props?.value) : ""}
                                      onChange={(date) => props.onChange(moment(date))}
                                    />
                                  </MuiPickersUtilsProvider>
                                )}
                              />
                              {errors.start_date && (
                                <FormHelperText error>{`Required ! ${errors.start_date?.message}`}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>

                          <Grid item xs={6} sm={4} lg={3}>
                            <FormControl fullWidth error={errors.end_date ? true : false} required={true}>
                              <FormHelperText>
                                <b>End Date *</b>
                              </FormHelperText>
                              <Controller
                                name={"end_date"}
                                control={control}
                                rules={{ required: true }}
                                render={(props: any) => (
                                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                      disableToolbar
                                      format="dd MMM yyyy"
                                      value={props?.value ? moment(props?.value) : ""}
                                      onChange={(date) => props.onChange(moment(date))}
                                    />
                                  </MuiPickersUtilsProvider>
                                )}
                              />
                              {errors.end_date && (
                                <FormHelperText error>{`Required ! ${errors.end_date?.message}`}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6} className={classes.buttonWrapper}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextInput
                          name="name"
                          register={register}
                          required={true}
                          label="Convention name *"
                          errors={!!errors.name}
                          errorMessage={errors.name?.message}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextInput
                          name="link_to_official_site"
                          register={register}
                          label="Link to official site"
                          errors={!!errors.link_to_official_site}
                          errorMessage={errors.link_to_official_site?.message}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextInput
                          name="facebook_link"
                          register={register}
                          label="Facebook link"
                          errors={!!errors.facebook_link}
                          errorMessage={errors.facebook_link?.message}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6} className={classes.buttonWrapper}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth error={errors.country ? true : false} required={true}>
                          <FormHelperText>
                            <b>Country *</b>
                          </FormHelperText>
                          <Controller
                            name={"country"}
                            control={control}
                            rules={{ required: true }}
                            render={(props: any) => (
                              <Autocomplete
                                freeSolo
                                options={countryList?.map((option: { label: string }) => option.label ?? "")}
                                defaultValue={""}
                                inputValue={props?.value}
                                onInputChange={(event, newInputValue) => props.onChange(newInputValue)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    variant="outlined"
                                    InputProps={{ ...params.InputProps }}
                                  />
                                )}
                              />
                            )}
                          />
                          {errors.country && (
                            <FormHelperText error>{`Required ! ${errors.country?.message}`}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextInput
                          name="state"
                          register={register}
                          required={true}
                          label="State *"
                          errors={!!errors.state}
                          errorMessage={errors.state?.message}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextInput
                          name="city"
                          register={register}
                          required={true}
                          label="City *"
                          errors={!!errors.city}
                          errorMessage={errors.city?.message}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextInput
                          name="address"
                          register={register}
                          required={true}
                          multiline={true}
                          label="Address *"
                          errors={!!errors.address}
                          errorMessage={errors.address?.message}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} className={classes.buttonWrapper}>
                    <TextInput
                      name="description"
                      register={register}
                      required={true}
                      multiline={true}
                      label="Description *"
                      errors={!!errors.description}
                      errorMessage={errors.description?.message}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={4} className={classes.metaWrapper}>
                <Grid container>
                  <Grid item xs={12}>
                    <Card variant="outlined" className={classes.imageCard}>
                      <CardContent>
                        <Typography>Convention image</Typography>
                        <CardMedia
                          className={classes.imageCardMedia}
                          image={preview ? preview : "/images/camera.png"}
                        />
                        <input
                          className={classes.fileInput}
                          type={"file"}
                          ref={hiddenFileInput}
                          onChange={(e) => {
                            if (e.target.files) handleImageChange(e.target.files[0]);
                          }}
                        />
                      </CardContent>
                      <CardActions>
                        <Chip
                          icon={<EditIcon />}
                          label="Add convention image"
                          size="small"
                          onClick={handleImageChangeClick}
                        />
                        <Chip
                          icon={<DeleteOutlineIcon />}
                          label="Remove"
                          size="small"
                          onClick={handleImageRemoveClick}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2} className={classes.buttonWrapper}>
                  <Grid item xs={12} sm={4} md={2}>
                    <PrimaryButton size="small" fullWidth variant="outlined" primaryColor onClick={handleCancel}>
                      Cancel
                    </PrimaryButton>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <PrimaryButton size="small" fullWidth primaryColor disabled={isSubmitting} type="submit">
                      Save
                    </PrimaryButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </AdminBody>
  );
}
