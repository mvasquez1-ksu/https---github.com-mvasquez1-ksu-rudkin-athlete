import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";

type Inputs = {
  athleteName: string;
  athleteEmail: string;
  athletePhone: string;
  athleteAddress: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  matchAthleteAddress: boolean;
  sport: string;
  package: string;
  highSchool?: string;
  classOf?: string;
  position?: string;
  events?: string;
  yearsPlayed?: string;
  academicAchievements?: string;
  gpa?: string;
  classRank?: string;
  photos?: File[];
};

export default function Form() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const athleteAddress = watch("athleteAddress", "");
  const matchAthleteAddress = watch("matchAthleteAddress", false);
  const packageLevel = watch("package", "level 1");
  const [page, setPage] = useState(0);
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (page == 0) {
      setPage(1);
    } else {
      const emailContent = `
      <p>Name: ${data.athleteName}</p>
      <p>Email: ${data.athleteEmail}</p>
      <p>Phone: ${data.athletePhone}</p>
      <p>Address: ${data.athleteAddress}</p>
      <p>Name: ${data.parentName}</p>
      <p>Email: ${data.parentEmail}</p>
      <p>Phone: ${data.parentPhone}</p>
      <p>Address: ${data.parentAddress}</p>
      <p>Sport: ${data.sport}</p>
      <p>Package: ${data.package}</p>
      <p>High School: ${data.highSchool ?? data.highSchool}</p>
      <p>Class Of: ${data.classOf ?? data.classOf}</p>
      <p>Position: ${data.position ?? data.position}</p>
      <p>Events: ${data.events ?? data.events}</p>
      <p>Years Played: ${data.yearsPlayed ?? data.yearsPlayed}</p>
      <p>Academic Achievements: ${
        data.academicAchievements ?? data.academicAchievements
      }</p>
      <p>GPA: ${data.gpa ?? data.gpa}</p>
      <p>Class Rank: ${data.classRank ?? data.classRank}</p>
      `;
      const formData = new FormData();
      formData.append("html", emailContent);
      if (data.photos) {
        for (let i = 0; i < data.photos.length; i++) {
          formData.append("photos", data.photos[i]);
        }
      }
      axios
        .post("/send-email", formData)
        .then((response) => console.log(response))
        .catch((error) => console.log(error));
    }
  };

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <div className="container">
      {page === 0 && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="form-inline"
          encType="multipart/form-data"
        >
          {/* register your input into the hook by invoking the "register" function */}
          <div className="mb-3">
            <label htmlFor="a_nameInput" className="form-label">
              Athlete Name
            </label>
            <input
              className="form-control"
              id="a_nameInput"
              {...register("athleteName", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="a_emailInput" className="form-label">
              Email
            </label>
            <input
              className="form-control"
              id="a_emailInput"
              type="email"
              {...register("athleteEmail", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="a_phoneInput" className="form-label">
              Phone
            </label>
            <input
              className="form-control"
              id="a_phoneInput"
              {...register("athletePhone", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="a_addressInput" className="form-label">
              Address, City, State, Zip
            </label>
            <input
              className="form-control"
              id="a_addressInput"
              {...register("athleteAddress", { required: true })}
            />
          </div>
          <div className="mb-3">
            {/* include validation with required or other standard HTML validation rules */}
            <label htmlFor="p_nameInput" className="form-label">
              Parent Name
            </label>
            <input
              className="form-control"
              {...register("parentName", { required: true })}
            />
            {/* errors will return when field validation fails  */}
            {errors.parentName && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="p_emailInput" className="form-label">
              Parent Email
            </label>
            <input
              className="form-control"
              {...register("parentEmail", { required: true })}
            />
            {errors.parentEmail && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="p_phoneInput" className="form-label">
              Parent Phone
            </label>
            <input
              className="form-control"
              {...register("parentPhone", { required: true })}
            />
            {errors.parentPhone && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="p_addressInput" className="form-label">
              Parent Address
            </label>
            <input
              className="form-control"
              defaultValue={matchAthleteAddress ? athleteAddress : ""}
              disabled={matchAthleteAddress && true}
              {...register("parentAddress", { required: true })}
            />
            {errors.parentAddress && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <div className="btn-group">
            <input
              type="checkbox"
              className="form-check-input"
              id="btncheck1"
              autoComplete="off"
              {...register("matchAthleteAddress")}
            />
            <label className="form-check-label" htmlFor="btncheck1">
              Same as athlete
            </label>
          </div>
          <div className="mb-3">
            <label htmlFor="sportInput" className="form-label">
              Name Your Sport
            </label>
            <input
              className="form-control"
              {...register("sport", { required: true })}
            />
            {errors.sport && (
              <div className="alert alert-danger" role="alert">
                This field is required
              </div>
            )}
          </div>
          <fieldset className="row mb-3">
            <legend className="col-form-label col-sm-2 pt-0">Package</legend>
            <div className="col-sm-10">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  {...register("package", { required: true })}
                  id="gridRadios1"
                  value="level 1"
                />
                <label className="form-check-label" htmlFor="gridRadios1">
                  Level 1 $295 - Flyer
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  {...register("package", { required: true })}
                  id="gridRadios2"
                  value="level 2"
                />
                <label className="form-check-label" htmlFor="gridRadios2">
                  Level 2 $995 - Flyer and One-page Website w/subdomain
                </label>
              </div>
              <div className="form-check disabled">
                <input
                  className="form-check-input"
                  type="radio"
                  {...register("package", { required: true })}
                  id="gridRadios3"
                  value="level 3"
                />
                <label className="form-check-label" htmlFor="gridRadios3">
                  Level 3 $1499 - Flyer and One-page Website w/custom domain (+
                  cost of domain)
                </label>
              </div>
            </div>
          </fieldset>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      )}
      {page === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
          <div id="page2Help" className="form-text">
            Only fill in information that you want to be included:
          </div>
          <div className="mb-3">
            <label htmlFor="highSchoolInput" className="form-label">
              High School Name
            </label>
            <input
              className="form-control"
              id="highSchoolInput"
              {...register("highSchool")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="classOfInput" className="form-label">
              Class of:
            </label>
            <input
              className="form-control"
              id="classOfInput"
              {...register("classOf")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="positionInput" className="form-label">
              Position
            </label>
            <textarea
              className="form-control"
              id="positionInput"
              {...register("position")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="eventsInput" className="form-label">
              Events
            </label>
            <textarea
              className="form-control"
              id="eventsInput"
              {...register("events")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="yearsPlayedInput" className="form-label">
              Years Played
            </label>
            <input
              className="form-control"
              id="yearsPlayedInput"
              {...register("yearsPlayed")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="academicAchievementsInput" className="form-label">
              Academic Achievements
            </label>
            <textarea
              className="form-control"
              id="academicAchievementsInput"
              {...register("academicAchievements")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="gpaInput" className="form-label">
              GPA
            </label>
            <input
              className="form-control"
              id="gpaInput"
              {...register("gpa")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="classRankInput" className="form-label">
              Class Rank
            </label>
            <input
              className="form-control"
              id="classRankInput"
              {...register("classRank")}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="photoUploadInput" className="form-label">
              Upload photos:
            </label>
            <div id="photoUploadHelp" className="form-text">
              Up to {packageLevel == "level 1" ? "5" : "15"} photos can be
              uploaded.
            </div>
            <input
              className="form-control"
              type="file"
              id="photoUploadInput"
              accept="image/*"
              multiple
              {...register("photos")}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Pay Now
          </button>
        </form>
      )}
    </div>
  );
}
