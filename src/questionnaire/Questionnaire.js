import { Alert, Link, InputAdornment, Tooltip, Dialog, DialogContent, DialogTitle, DialogContentText, Grid, Typography, Box, Button, CircularProgress, Paper, DialogActions } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useState, useRef, useEffect, memo } from 'react';
import useStyles from './styles';
import default_questions from './questions.json';
import { getQuestionnaire, getQuestionnaireOptionsByLender, getQuestionnaireOptionsByShortCode, submitQuestionnaire } from '../api/API';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HelpIcon from '@mui/icons-material/Help';
import CheckIcon from '@mui/icons-material/Check';
import GeoSelector2 from './fields/GeoSelector2';
import StaticDatePickerField from './fields/StaticDatePickerField';
import ToggleGroupField from './fields/ToggleGroupField';
import MultiSelectButtonsField from './fields/MultiSelectButtonsField';
import SwitchField from './fields/SwitchField';
import NumberField from './fields/NumberField';
import InputField from './fields/InputField';
import QuestionnaireSkeleton from './QuestionnaireSkeleton';
import { useSearchParams, useLocation, useParams } from "react-router-dom";


const Questionnaire = () => {
    const location = useLocation();
    const { code, lender_id,short_code } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [questionnaireNotification, setQuestionnaireNotification] = useState(false);
    const [questionnaireData, setQuestionnaireData] = useState();
    const [questions,setQuestions]=useState(default_questions);
    const [lender, setLender] = useState();
    const classes = useStyles();
    const formEl = useRef(null);
    const allfields = questions.reduce((acc, step) => {
        step.columns?.forEach(col => {
            col.fields?.forEach(field => {
                acc.push(field);
            })
            col.groups?.forEach(group => {
                group.fields?.forEach(field => {
                    acc.push(field);
                })
            })
        })
        return acc;
    }, []);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const init = () => {
        if (lender_id)
            loadQuestionnaireOptionsByLender();
        else if (short_code)
            loadQuestionnaireOptionsByShortCode();
        else
            loadQuestionnaire();
    }

    const loadQuestionnaireOptionsByShortCode=async ()=>{
        setLoading(true);
        try {
            let data = await getQuestionnaireOptionsByShortCode(short_code);
            data.questionnaire = {};
            if (searchParams.get("email")) data.questionnaire.primary_email = searchParams.get("email");
            if (searchParams.get("phone")) data.questionnaire.phone = searchParams.get("phone");
            if (searchParams.get("first_name")) data.questionnaire.first_name = searchParams.get("first_name");
            if (searchParams.get("last_name")) data.questionnaire.last_name = searchParams.get("last_name");
            if (searchParams.get("organization")) data.questionnaire.organization_name = searchParams.get("organization");
            setQuestionnaireData(data);
            setLender(data.lender);
            if (data.template?.settings?.pages?.length>0) {
                setQuestions(data.template.settings.pages);
            } 
        } catch (err) {
            setQuestionnaireNotification(<>
                <p>{err.message || "Questionnaire not found"}</p>
                <Link
                    href="https://www.nxt-cre.com"
                    rel="questionnaire"
                    variant="body2"
                    sx={{ mb: 2 }}
                >GO TO NXT-CRE.COM</Link>
            </>);
        }
        setLoading(false);
    }

    const loadQuestionnaireOptionsByLender = async () => {
        if (questions.findIndex((el => el.name == 'contacts')) == -1) {
            console.error("Questions list doesn't contain page with 'contacts' name");
            setQuestionnaireNotification(<>
                <p>Internal error</p>
                <Link
                    href="https://www.nxt-cre.com"
                    rel="questionnaire"
                    variant="body2"
                    sx={{ mb: 2 }}
                >GO TO NXT-CRE.COM</Link>
            </>);
            return;
        }
        if (!questions[0].submit_if_any) {
            console.error("First page of questions should contain 'submit_if_any' field");
        }
        setLoading(true);
        try {
            let data = await getQuestionnaireOptionsByLender(lender_id);
            data.questionnaire = {};
            if (searchParams.get("email")) data.questionnaire.primary_email = searchParams.get("email");
            if (searchParams.get("phone")) data.questionnaire.phone = searchParams.get("phone");
            if (searchParams.get("first_name")) data.questionnaire.first_name = searchParams.get("first_name");
            if (searchParams.get("last_name")) data.questionnaire.last_name = searchParams.get("last_name");
            if (searchParams.get("organization")) data.questionnaire.organization_name = searchParams.get("organization");
            setQuestionnaireData(data);
            setLender(data.lender);
        } catch (err) {
            setQuestionnaireNotification(<>
                <p>{err.message || "Questionnaire not found"}</p>
                <Link
                    href="https://www.nxt-cre.com"
                    rel="questionnaire"
                    variant="body2"
                    sx={{ mb: 2 }}
                >GO TO NXT-CRE.COM</Link>
            </>);
        }
        setLoading(false);
    }

    const loadQuestionnaire = async () => {
        setLoading(true);
        try {
            let data = await getQuestionnaire(code);
            setLender(data?.questionnaire?.organization);
            if (data.questionnaire?.template?.settings?.pages?.length>0) {
                setQuestions(data.questionnaire.template.settings.pages);
            }   
            //console.log(data);
            if (data?.questionnaire?.status === 'completed') {
                if (data.user_exists) /**TODO show notification on login page that account exists */
                    setQuestionnaireNotification(
                        <>
                            <h1>This form has been submitted</h1>
                            <p>This form has already been submitted and an account has been created. </p>
                            <Link
                                href={process.env.REACT_APP_MAIN_URL}
                                rel="questionnaire"
                                variant="body2"
                                sx={{ mb: 2 }}
                            >GO TO DASHBOARD</Link>
                        </>
                    );
                else if (data?.questionnaire?.reinvesting) {
                    setQuestionnaireNotification(
                        <>
                            <h1>This form has been submitted</h1>
                            <p>To view property matches now, set up your account.</p>
                            <Link
                                href={process.env.REACT_APP_MAIN_URL + "/auth/register/mbi/" + code}
                                rel="questionnaire"
                                variant="body2"
                                sx={{ mb: 2 }}
                            >SET UP YOUR ACCOUNT</Link>
                        </>
                    );
                    window.location.href = process.env.REACT_APP_MAIN_URL + "/auth/register/mbi/" + code;
                    console.log("redirect to registration");
                } else {
                    setQuestionnaireNotification(
                        <>
                            <h1>This form has been submitted</h1>
                        </>
                    );
                }
            } else {
                data.questionnaire.primary_email = data.questionnaire?.email;//to prefill contact form
                //console.log("data", data);
                setQuestionnaireData(data);
            }
        } catch (err) {
            setQuestionnaireNotification(<>
                <p>{err.message || "Questionnaire not found"}</p>
                <Link
                    href="https://www.nxt-cre.com"
                    rel="questionnaire"
                    variant="body2"
                    sx={{ mb: 2 }}
                >GO TO NXT-CRE.COM</Link>
            </>);
        }
        setLoading(false);
    };

    useEffect(() => {
        //console.log('useef');
        init();
    }, []);


    const renderField = (field, formvalues, formref, setFieldValue) => {
        //console.log('renderField');
        if (field.show_if) {
            let show = Object.keys(field.show_if).every(key => {
                return formvalues[key] === field.show_if[key];
            });
            if (!show) return '';
        }
        let choices = field.choices;
        if (field.choices_data) choices = questionnaireData[field.choices_data];
        if (['toggle', 'select_tiles'].includes(field.type) && !choices) {
            console.warn("Choices is not provided for field " + field.name)
            return '';
        }
        if (field.tooltip) {
            field.props.InputProps = {
                endAdornment: (
                    <InputAdornment position="end" style={{ outline: "none" }}>
                        <Tooltip title={field.tooltip.content}><HelpIcon color="light" style={{ "cursor": "default" }} size="small" /></Tooltip>
                    </InputAdornment>
                ),
            }
        }
        switch (field.type) {
            case 'datepicker':
                return <StaticDatePickerField
                    name={field.name}
                    disabled={(field.disable_if_present && questionnaireData?.questionnaire && questionnaireData.questionnaire[field.name]) ? true : false}
                    {...field.props} />;
            case 'switch':
                return <SwitchField
                    name={field.name}
                    label={field.label}
                    {...field.props}
                    disabled={(field.disable_if_present && questionnaireData?.questionnaire && questionnaireData.questionnaire[field.name]) ? true : false}
                />
            case 'toggle':
                return (
                    <ToggleGroupField
                        name={field.name}
                        exclusive={field.exclisive !== false ? true : false}
                        choices={choices}
                        disabled={(field.disable_if_present && questionnaireData?.questionnaire && questionnaireData.questionnaire[field.name]) ? true : false}
                        {...field.props}
                    />
                )
            case 'select_tiles':
                let additional_choices;
                if (field.max_options && choices?.length > field.max_options) {
                    additional_choices = choices.slice(field.max_options);
                    choices = choices.slice(0, field.max_options);
                }
                return <MultiSelectButtonsField
                    values={field?.values || []}
                    name={field.name}
                    choices={choices}
                    otherChoices={additional_choices}
                    disabled={(field.disable_if_present && questionnaireData?.questionnaire && questionnaireData.questionnaire[field.name]) ? true : false}
                    {...field.props}
                />
            case 'county_selector':
                return <GeoSelector2
                    name={field.name}
                    label={field.label}
                />
            case 'number':
                return <NumberField
                    name={field.name}
                    label={field.label}
                    disabled={(field.disable_if_present && questionnaireData?.questionnaire && questionnaireData.questionnaire[field.name]) ? true : false}
                    {...field.props}
                />
            case 'text':
                return <InputField
                    name={field.name}
                    label={field.label}
                    disabled={(field.disable_if_present && questionnaireData?.questionnaire && questionnaireData.questionnaire[field.name]) ? true : false}
                    {...field.props} />
            default:
                console.warn("Field type " + field.type + " not found for field " + field.name);
                return field.type;
        }
    }
    const getValidationRules = (field) => {
        let validation = Yup[field.validation.type]();
        Object.keys(field.validation).forEach((func) => {
            if (typeof validation[func] === 'function' && func !== 'type') {
                if (Array.isArray(field.validation[func])) {
                    if (field.validation[func][0] === 'ref') {
                        validation = validation[func](Yup.ref(field.validation[func][1]), field.validation[func][2]);
                    } else {
                        const vals = [...field.validation[func]];
                        if (func === 'matches') {
                            var flags = vals[0].replace(/.*\/([gimy]*)$/, '$1');
                            var pattern = vals[0].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                            vals[0] = new RegExp(pattern, flags);
                        }
                        validation = validation[func](...vals);
                    }
                } else validation = validation[func](field.validation[func]);
            }
            else if (func !== 'type')
                console.warn(func + " is not part of Yup");
        });
        return validation;
    }
    const isPreviousQuestionsAnswered = (item, formvalues) => {
        let fields = item.fields;
        if (!fields && item.groups) item.groups.forEach(group => { fields = [...fields, ...group.fields] });
        if (!fields) return false;
        if (fields?.length === 0) return true;
        return fields.every(el => formvalues[el.name] ? true : false);
    }

    const isLastStep = (formvalues) => {
        if (step === (questions?.length - 1)) return true;
        if (lender_id && step == 0) return false; //we have to ask for contact information in case we don't have questionnaire code
        if (questions[step].submit_if_any) {
            return Object.keys(questions[step].submit_if_any).some(key => {
                return formvalues[key] === questions[step].submit_if_any[key];
            });
        }
        return false;
    }

    const goNext = (formvalues) => {
        if (step == 0 && lender_id) {
            let reinvesting = !Object.keys(questions[0].submit_if_any || []).some(key => {
                return formvalues[key] === questions[0].submit_if_any[key];
            });
            if (!reinvesting)
                //questions SHOULD contain field with name 'contacts'!!!
                setStep(questions.findIndex((el => el.name == 'contacts')));
            else
                setStep(step + 1);
        } else
            setStep(step + 1);
        //console.log(formvalues)
    }

    const goBack = (formvalues) => {
        if (lender_id && step == questions.findIndex((el => el.name == 'contacts'))) {
            let reinvesting = !Object.keys(questions[0].submit_if_any || []).some(key => {
                return formvalues[key] === questions[0].submit_if_any[key];
            });
            if (!reinvesting)
                setStep(0);
            else
                setStep(step - 1);
        } else
            setStep(step - 1);
    }

    const onSubmit = async (values, setSubmitting) => {
        let data = { ...values };
        if (data.counties && data.counties?.length) data.counties = data.counties.map((loc => loc.id));
        if (data.payoff_reason === 'REFINANCE') data.reinvesting = false;
        if (!data.reinvesting && !code) {
            //we don't need to save non-reinvesting questionnaire if it's universal/direct link
            setQuestionnaireNotification(<>
                <h1>Thank you</h1>
                <p>Thank you for your response, you may now close this window.</p>
                </>
            );
            return;
        }
        allfields.forEach(field => {
            if (field.type === "datepicker") {
                data[field.name] = {
                    "__type": "Date",
                    "iso": data[field.name]
                };
                //console.log("changed " + field.name + " to date", data[field.name]);
            }
        });
        if (!questionnaireData.questionnaire.id && lender_id) { //external questionnaire by lender_id
            data.lender_id = lender_id;
        } else if (short_code) {
            data.short_code=short_code;
        } else
            data.code = questionnaireData.questionnaire?.code || questionnaireData.questionnaire?.code_for_copy;
        setSubmitting(true);
        try {
            console.log("submitting", data);
            const res = await submitQuestionnaire(data);

            if (data.reinvesting) {
                //console.log("redirect_code", res);
                if (!searchParams.get("embedded")) {
                    setLoading(true);
                    window.location.href = process.env.REACT_APP_MAIN_URL + "/auth/register/mbi/" + res.redirect_code;
                }
            }
            setQuestionnaireNotification(<>
                <h1>Thank you</h1>
                <p>Thank you for your response, you may now close this window.</p>
                {searchParams.get("embedded") && data.reinvesting &&
                    <>
                        To view property matches now, set up your account on nxt-CRE.com <br />
                        <Link
                            href={process.env.REACT_APP_MAIN_URL + "/auth/register/mbi/" + res?.redirect_code}
                            rel="questionnaire"
                            variant="body2"
                            target="_blank"
                            sx={{ mb: 2 }}
                        >GO TO NXT-CRE.COM</Link>
                    </>
                }
            </>)
        } catch (err) {
            console.log(err);
            //toast.error(err.message);
        }
        setSubmitting(false);
    }

    const replaceVariables = (text) => {
        const getValue = (m, key) => {
            //console.log(key);
            let v = key.split("|");
            let parts = v[0].split(".");
            let result = parts[0] == 'lender' ? lender : questionnaireData;
            for (var i = 1; i < parts.length; i++) {
                //console.log(i + ":", result);
                if (result) result = result[parts[i]];
            }
            if (!result) result = v[1] || ""; //default value or blank
            //console.log(result);
            return result;
        }
        return text.replace(/%(.+?)%/g, getValue);
        return text;
    }

    return (
        <>
            <Formik
                enableReinitialize
                validateForm
                validateOnMount
                innerRef={formEl}
                onSubmit={onSubmit}
                initialValues={allfields.reduce((a, v) => ({ ...a, [v.name]: (questionnaireData?.questionnaire ? questionnaireData?.questionnaire[v.name] : null) || (v.initial_value !== undefined ? v.initial_value : "") }), {})}
                validationSchema={Yup.object().shape(questions[step]?.columns?.reduce((a, v) => {
                    let rules = {};
                    v.fields?.forEach(field => {
                        if (field.validation?.type) {
                            rules[field.name] = getValidationRules(field)
                        }
                    });
                    v.groups?.forEach(group => {
                        group.fields.forEach(field => {
                            if (field.validation?.type) {
                                rules[field.name] = getValidationRules(field)
                            }
                        });
                    });
                    return { ...a, ...rules };
                }, {}))}
            >
                {({ isSubmitting, setSubmitting, values, isValid, errors, setFieldValue }) => (
                    <Form ref={formEl}>
                        <Dialog

                            classes={{
                                root: classes.backDrop,
                            }}
                            PaperProps={{
                                style: {
                                    background: 'linear-gradient(136.2deg, #FFFFFF 16.4%, #C8D1C8 92.26%)',
                                    boxShadow: '0px 0px 50px 10px rgba(0, 0, 0, 0.5)',
                                    maxWidth: questions[step]?.maxWidth || '900px',
                                    margin: '10px',
                                    minWidth: searchParams.get("embedded") ? "100%" : (questions[step]?.minWidth || '60%'),
                                },
                            }}
                            fullScreen={searchParams.get("embedded") ? true : false}
                            open={true}
                            aria-labelledby="form-dialog-title"
                            scroll="paper"
                        >
                            {isLoading &&
                                <QuestionnaireSkeleton />
                            }
                            {!isLoading && questionnaireNotification &&
                                <Alert sx={{ fontSize: '18px' }} >{questionnaireNotification}</Alert>
                            }
                            {!isLoading && !questionnaireNotification &&
                                <>
                                    <DialogTitle>
                                        <Box style={{ marginLeft: '20px', marginTop: '20px', }} >
                                            {lender?.logo &&
                                                <img
                                                    src={lender?.logo?.url}
                                                    alt="Logo"
                                                    height="55px"
                                                    style={{ float: 'left', marginRight: '40px' }}
                                                />
                                            }
                                            {questions[step]?.title &&
                                                <Typography variant='h4'>{replaceVariables(questions[step].title)}</Typography>
                                            }
                                            {questions[step]?.subtitle_external && lender_id ?
                                                <Typography variant='p' style={{ marginBottom: '5px' }} dangerouslySetInnerHTML={{ __html: replaceVariables(questions[step]?.subtitle_external) }} />
                                                : <>
                                                    {questions[step]?.subtitle &&
                                                        <Typography variant='p' style={{ marginBottom: '5px' }} dangerouslySetInnerHTML={{ __html: replaceVariables(questions[step]?.subtitle) }} />
                                                    }
                                                </>
                                            }
                                        </Box>
                                    </DialogTitle>

                                    <DialogContent>
                                        {questions[step]?.notice && !(questions[step]?.hide_notice_if_last_step && isLastStep(values)) &&
                                            <Paper className={classes.dialogSubtitlePaper}>
                                                <DialogContentText dangerouslySetInnerHTML={{ __html: replaceVariables(questions[step]?.notice) }} />
                                            </Paper>
                                        }
                                        <Box sx={{ mt: 2 }} />

                                        <Grid container direction='row' {...questions[step]?.grid_props}>
                                            {questions[step]?.columns?.map((col, key) => {
                                                let hide = col.hide_before_previous;
                                                if (hide) hide = !isPreviousQuestionsAnswered(questions[step]?.columns[key - 1], values);
                                                if (hide) return '';
                                                return (
                                                    <Grid item key={key} xs={12} md={12 / (questions[step]?.columns?.length || 1)} sx={{ p: 1 }} className={col.hide_before_previous ? classes.hoverItem : ''}>
                                                        {col.title &&
                                                            <Typography variant='h5' style={{ marginBottom: '16px' }}>{col.title}</Typography>
                                                        }
                                                        <Grid
                                                            container
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            spacing={4}
                                                        >
                                                            {col?.fields?.map((field, fk) => (
                                                                <Grid item key={fk} xs={field.grid_props?.xs || 12}  {...field.grid_props}>
                                                                    {renderField(field, values, formEl)}
                                                                </Grid>
                                                            ))}
                                                            {col?.groups?.map((group, kg) => (
                                                                <Grid item key={kg} xs={group.grid_props?.xs || 12} {...group.grid_props} >
                                                                    <Paper style={{ padding: '20px', backgroundColor: 'rgba(255,255,255, .2)' }}>
                                                                        {group.title &&
                                                                            <Typography variant='h5' style={{ marginBottom: '16px' }}>{group.title}</Typography>
                                                                        }
                                                                        <Grid
                                                                            container
                                                                            direction="row"
                                                                            justifyContent="space-between"
                                                                            alignItems="center"
                                                                            spacing={4}
                                                                        >
                                                                            {group?.fields?.map((field, fk) => (
                                                                                <Grid item key={fk} xs={field.grid_props?.xs || 12} {...field.grid_props}>
                                                                                    {renderField(field, values, formEl)}
                                                                                </Grid>
                                                                            ))}
                                                                        </Grid>
                                                                    </Paper>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                    </DialogContent>
                                    <DialogActions sx={{ mx: 5 }}>
                                        <Grid
                                            container
                                            direction='row'
                                            justifyContent="center"
                                            alignItems="center"
                                            spacing={0}
                                        >
                                            <Grid item xs={6} sm={4}>
                                                <Box
                                                    display="flex"
                                                    justifyContent="flex-start"
                                                    alignItems="center"
                                                >
                                                    {step !== 0 &&
                                                        <Button
                                                            onClick={() => { goBack(values) }}
                                                            className={classes.button}
                                                            variant="outlined"
                                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                                                            startIcon={<ChevronLeftIcon />}
                                                            id="back_btn"
                                                            size='large'>
                                                            Back
                                                        </Button>
                                                    }
                                                </Box>
                                            </Grid>
                                            <Grid item sm={4} order={{ xs: 3, sm: 2 }}>
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    style={{ padding: '20px' }}
                                                >
                                                    <img
                                                        src="/logo_powered_by.png"
                                                        alt="Powered by nxtCRE"
                                                        width={'140px'}
                                                    />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} sm={4} order={{ xs: 2, sm: 3 }}>
                                                <Box
                                                    display="flex"
                                                    justifyContent="flex-end"
                                                    alignItems="center"
                                                    fullWidth
                                                >
                                                    <Button
                                                        onClick={() => { if (!isLastStep(values)) goNext(values); else onSubmit(values, setSubmitting) }}
                                                        disabled={isSubmitting || !isValid}
                                                        type={'button'}
                                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                                                        variant="outlined"
                                                        color="primary"
                                                        size='large'
                                                        endIcon={isLastStep(values) ? <CheckIcon /> : <ChevronRightIcon />}
                                                        className={classes.button}
                                                        id="next_btn"
                                                    >
                                                        {isSubmitting && (
                                                            <CircularProgress
                                                                size={20}

                                                            />
                                                        )}
                                                        {isLastStep(values) ? 'SUBMIT' : 'NEXT'}
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </DialogActions>
                                </>
                            }
                        </Dialog >
                    </Form>
                )}
            </Formik>
        </>
    )
}
export default Questionnaire;