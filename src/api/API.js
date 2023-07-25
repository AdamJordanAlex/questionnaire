/* eslint-disable indent */
import axios from 'axios';
import axiosRetry from 'axios-retry';
import toast from 'react-hot-toast';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';


export const api = (addParseHeader=true) => {
  const url = window.location.protocol;
  const axiosClient = axios.create({
    baseURL: url,
    headers: {
      ...addParseHeader?{'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APP_ID}:{},
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json'
    },
    timeout: 50000,
  });

  axiosRetry(axiosClient, {
    retries: 0,
    shouldResetTimeout: true,
    retryCondition: () => true // retry no matter what
  });

  axiosClient.interceptors?.response.use(
    response => response,
    error => {
      console.log(error);
      return Promise.reject(error);
    }
  );
  return axiosClient;
};

export const getQuestionnaire = async (code)=>{
  try {
      const response=await api().post(process.env.REACT_APP_PARSE_URL + '/functions/get_questionnaire',{code,include_counties:process.env.REACT_APP_PRELOAD_COUNTIES=="true"?true:false});
      return response.data.result;
  } catch (error) {
      return handleStatusCode(error);
  }
}

export const getQuestionnaireOptionsByLender = async (lender_id)=>{
  try {
      const response=await api().post(process.env.REACT_APP_PARSE_URL + '/functions/get_questionnaire_options',{lender_id,include_counties:process.env.REACT_APP_PRELOAD_COUNTIES=="true"?true:false});
      return response.data.result;
  } catch (error) {
      return handleStatusCode(error);
  }
}

export const getQuestionnaireOptionsByShortCode = async (short_code)=>{
  try {
      const response=await api().post(process.env.REACT_APP_PARSE_URL + '/functions/get_questionnaire_options',{short_code,include_counties:process.env.REACT_APP_PRELOAD_COUNTIES=="true"?true:false});
      return response.data.result;
  } catch (error) {
      return handleStatusCode(error);
  }
}

export const submitQuestionnaire = async (values)=>{
  try {
      const response=await api().post(process.env.REACT_APP_PARSE_URL + '/functions/submit_questionnaire',values);
      return response.data.result;
  } catch (error) {
      return handleStatusCode(error);
  }
}

export const getIPinfo=async()=>{
  try {
      const response=await api(false).get('https://geolocation-db.com/json/')
      return response.data;
  } catch (error) {
     console.log("Can't get approximate location");
     return null;
  }
}

export const getCounties = async () => {
  try {
    const response = await api().get(process.env.REACT_APP_PARSE_URL + '/classes/county?limit=5000&order=state,name');
    //console.log(response);
    const { status } = response;
    handleStatusCode({ status_code: status });
    return response.data?.results||[]
  } catch (error) {
    return handleStatusCode(error);
  }
}

export const getCountyByCoords = async (lat,lng) => {
  try {
    const response = await api().get(process.env.REACT_APP_PARSE_URL + '/classes/county?limit=1&where={"area": { "$nearSphere": {"__type": "GeoPoint","latitude": '+lat+',"longitude": '+lng+'},"$maxDistanceInMiles": 10.0}}');
    //console.log(response);
    const { status } = response;
    handleStatusCode({ status_code: status });
    return response.data?.results||[]
  } catch (error) {
    return handleStatusCode(error);
  }
}

export const getPredictions = async (search) =>{
  try {
    const response = await api().post(process.env.REACT_APP_PARSE_URL + '/functions/fetch_geopredictions',{search});
    const { status } = response;
    handleStatusCode({ status_code: status });
    return response.data?.result||[]
  } catch (error) {
    return handleStatusCode(error);
  }
}

export const saveError = async(text,data,type="error",user) =>{
  try {
    await api().post(process.env.REACT_APP_PARSE_URL + '/classes/frontlog',{type,text,user,url: window.location.href,data });
  } catch (error) {
    console.log("ERR",error);
  }
}

export const handleStatusCode = (error) => {
  if (error.name === "AxiosError") error = error?.response?.data;
  switch (error?.response?.status || error?.status_code || error?.code) {
    case 200:
    case 201:
    case 204:
      break;
    case 209:
      toast.error(error?.message);
      //console.log("NEED LOGOUT");
      window.location.reload();
      throw new Error(error);
    case 409: //not showing error for 409 errors - to allow custom error handling with duplicates
      throw error;
    default:
      //console.error('ERR',error);
      toast.error((typeof error?.message === 'string' ? error?.message : JSON.stringify(error?.message)) || JSON.stringify(error?.error || error || "Server error"));
      throw error || new Error("Server error");
  }

};
