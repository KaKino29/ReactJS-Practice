import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import {
  getMovies,
  getTopRatedMovies,
  getUpComingMovies,
  IGetMoviesResult,
} from "../api";
import { makeImagePath } from "../utils";
import {
  faChevronLeft,
  faChevronRight,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 15px;
  width: 50%;
  display: flex;
  flex-direction: column;
  span {
    font-size: 20px;
  }
`;

const Slider = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  top: -100px;
`;

const SliderTitle = styled.h1`
  position: absolute;
  font-size: 30px;
  margin-left: 15px;
  top: -50px;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  position: relative;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 15px;
    font-weight: 600;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 30vw;
  height: 60vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 45%;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 30px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  top: -80px;
  font-size: 15px;
`;

const BigDetail = styled.div`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  top: -100px;
  font-size: 20px;
`;

const rowVars = {
  hidden: (leaving: boolean) => ({
    x: leaving ? -window.outerWidth + 6 : window.outerWidth - 6,
  }),
  visible: {
    x: 0,
  },
  exit: (leaving: boolean) => ({
    x: leaving ? window.outerWidth - 6 : -window.outerWidth + 6,
  }),
};

const boxVars = {
  normal: {
    scale: 1,
  },
  hover: {
    zIndex: 98,
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.4,
      type: "tween",
    },
  },
};

const infoVars = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
};

const offset = 6;

function Home() {
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>(
    "/movies/now_playing/:movieId"
  );
  const bigRatedMatch = useRouteMatch<{ movieId: string }>(
    "/movies/top_rated/:movieId"
  );
  const bigUpcomingMatch = useRouteMatch<{ movieId: string }>(
    "/movies/upcoming/:movieId"
  );
  const { scrollY } = useViewportScroll();
  const { data: data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies,", "nowPlaying"],
    getMovies
  );
  const { data: ratedData } = useQuery<IGetMoviesResult>(
    ["movies", "topRated"],
    getTopRatedMovies
  );
  const { data: upcomingData } = useQuery<IGetMoviesResult>(
    ["movies", "upcoming"],
    getUpComingMovies
  );
  const [index, setIndex] = useState(0);
  const [trIndex, setTrIndex] = useState(0);
  const [ucIndex, setUCIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const decreaseIndex = () => {
    if (data) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const topRateIncreaseIndex = () => {
    if (ratedData) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = ratedData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setTrIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const topRatedDecreaseIndex = () => {
    if (ratedData) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = ratedData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setTrIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const upComingIncreaseIndex = () => {
    if (upcomingData) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = upcomingData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setUCIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const upComingDecreaseIndex = () => {
    if (upcomingData) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = upcomingData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setUCIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const onBoxClicked = (movieId: number) => {
    history.push(`/movies/now_playing/${movieId}`);
  };
  const onRatedBoxClicked = (movieId: number) => {
    history.push(`/movies/top_rated/${movieId}`);
  };
  const onUpcomingBoxClicked = (movieId: number) => {
    history.push(`/movies/upcoming/${movieId}`);
  };
  const onOverlayClicked = () => history.push("/");
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => String(movie.id) === bigMovieMatch?.params.movieId
    );
  const clickedRated =
    bigRatedMatch?.params.movieId &&
    ratedData?.results.find(
      (movie) => String(movie.id) === bigRatedMatch?.params.movieId
    );
  const clickedUpcoming =
    bigUpcomingMatch?.params.movieId &&
    upcomingData?.results.find(
      (movie) => String(movie.id) === bigUpcomingMatch?.params.movieId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}>
            <Title>{data?.results[0].title}</Title>
            <Overview>
              <span style={{ fontSize: "15px", paddingBottom: "15px" }}>
                {data?.results[0].overview}
              </span>
              <span>Release date: {data?.results[0].release_date}</span>
              <span>
                Score:
                <FontAwesomeIcon
                  icon={faStar}
                  style={{
                    color: "gold",
                    fontSize: "20px",
                    paddingLeft: "3px",
                    paddingRight: "5px",
                  }}
                />
                {data?.results[0].vote_average}
              </span>
              <span>Vote count: {data?.results[0].vote_count}</span>
            </Overview>
          </Banner>
          <Slider>
            <SliderTitle>Now Playing</SliderTitle>
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={decreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingLeft: 10,
                cursor: "pointer",
              }}
            />
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                key={index}
                custom={back}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={increaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingRight: 10,
                cursor: "pointer",
              }}
            />
          </Slider>
          <Slider style={{ top: "0px" }}>
            <SliderTitle>Top Rated Movies</SliderTitle>
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={topRatedDecreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingLeft: 10,
                cursor: "pointer",
              }}
            />
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                key={trIndex}
                custom={back}
              >
                {ratedData?.results
                  .slice(1)
                  .slice(offset * trIndex, offset * trIndex + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      onClick={() => onRatedBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={topRateIncreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingRight: 10,
                cursor: "pointer",
              }}
            />
          </Slider>
          <Slider style={{ top: "100px" }}>
            <SliderTitle>Coming Soon</SliderTitle>
            <FontAwesomeIcon
              icon={faChevronLeft}
              onClick={upComingDecreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingLeft: 10,
                cursor: "pointer",
              }}
            />
            <AnimatePresence
              initial={false}
              onExitComplete={toggleLeaving}
              custom={back}
            >
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                key={ucIndex}
                custom={back}
              >
                {upcomingData?.results
                  .slice(1)
                  .slice(offset * ucIndex, offset * ucIndex + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      onClick={() => onUpcomingBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={upComingIncreaseIndex}
              style={{
                width: 40,
                height: 200,
                fontSize: 30,
                zIndex: 1,
                background: "rgba(0, 0, 0, 0.4)",
                paddingRight: 10,
                cursor: "pointer",
              }}
            />
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  layoutId={bigMovieMatch.params.movieId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                      <BigDetail>
                        <span>Release date: {clickedMovie.release_date}</span>
                        <span>
                          Score:
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedMovie.vote_average}
                        </span>
                        <span>Vote count: {clickedMovie.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
            {bigRatedMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  layoutId={bigRatedMatch.params.movieId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedRated && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedRated.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedRated.title}</BigTitle>
                      <BigOverview>{clickedRated.overview}</BigOverview>
                      <BigDetail>
                        <span>Release date: {clickedRated.release_date}</span>
                        <span>
                          Rating:
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedRated.vote_average}
                        </span>
                        <span>Vote count: {clickedRated.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
            {bigUpcomingMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClicked}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  layoutId={bigUpcomingMatch.params.movieId}
                  style={{ top: scrollY.get() + 250 }}
                >
                  {clickedUpcoming && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedUpcoming.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedUpcoming.title}</BigTitle>
                      <BigOverview>{clickedUpcoming.overview}</BigOverview>
                      <BigDetail>
                        <span>
                          Release date: {clickedUpcoming.release_date}
                        </span>
                        <span>
                          Rating:
                          <FontAwesomeIcon
                            icon={faStar}
                            style={{
                              color: "gold",
                              fontSize: "20px",
                              paddingLeft: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          {clickedUpcoming.vote_average}
                        </span>
                        <span>Vote count: {clickedUpcoming.vote_count}</span>
                      </BigDetail>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
