import { makeStyles } from '@mui/styles';
export default makeStyles(theme => ({
  stepper: {
    margin: theme.spacing(0)
  },
  form: {
    margin: theme.spacing(3)
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),

  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
  backDrop: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(20, 40, 30,  .6)'
  },
  backDropEmbedded: {
    background: 'transparent',
  },
  dialogSubtitlePaper: {
    padding: '15px',
    margin: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: '0.1em',
    boxShadow: '0px 0px 15px 1px rgba(0,0,0,0.16)'
  },
  dialog: {
    background: 'linear-gradient(136.2deg, #FFFFFF 16.4 %, #C8D1C8 92.26 %)',
    boxShadow: '0px 0px 50px 10px rgba(0, 0, 0, 0.5)'
  },
  hoverItem: { transition: '1s' },

}));
